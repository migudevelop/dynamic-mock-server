import { useCallback, useEffect, useState } from "react";

import { tauriCommands } from "@/helpers/tauri-commands";
import { useAdminApi } from "@/hooks/use-admin-api";
import { useProjectStore } from "@/stores/project-store";
import { useServerStore } from "@/stores/server-store";
import type { RouteDto } from "@/types/route.types";
import {
  suiteArrayToRecord,
  suiteRecordToArray,
  type SuiteRoutesRecord,
} from "@/types/suite.types";

/** Raw disk format for a suite file */
interface DiskSuite {
  /** Suite identifier */
  id: string;
  /** Route → response assignments */
  routes: SuiteRoutesRecord;
  /** ID of the suite this suite extends, or undefined */
  extends?: string;
}

/** Raw disk format for a route file */
interface DiskRoute {
  /** Route identifier */
  id: string;
  /** URL path pattern */
  url: string;
  /** HTTP method */
  method: string;
  /** Available responses */
  responses: Array<{
    id: string;
    status?: number;
    body?: unknown;
    delay?: number;
  }>;
}

export interface SuiteDetailState {
  /** All routes available in the project */
  routes: RouteDto[];
  /**
   * Current suite assignments: routeId → responseId.
   * Only contains routes that are assigned to this suite.
   */
  assignments: SuiteRoutesRecord;
  /** Whether data is being loaded */
  isLoading: boolean;
  /** Error message if loading or saving failed */
  error: string | null;
  /** Whether there are unsaved changes */
  isDirty: boolean;
  /** Whether we are in offline mode (reading from disk) */
  isDiskMode: boolean;
  /** Whether the suite is the currently active one */
  isActiveSuite: boolean;
  /** ID of the suite this suite extends, if any */
  extendsId: string | null;
  /** IDs of all other suites (used to populate the Extends selector) */
  allSuiteIds: string[];
  /** Updates the extendsId for this suite */
  setExtendsId: (id: string | null) => void;
  /** Updates the response assigned to a route in this suite */
  setRouteResponse: (routeId: string, responseId: string | null) => void;
  /** Saves the current assignments (via admin API or to disk) */
  save: () => Promise<void>;
  /** Toggles the suite active state (online only) */
  toggleActive: () => Promise<void>;
  /** Reloads the suite data */
  reload: () => Promise<void>;
}

/**
 * Manages data fetching and mutations for the suite detail page.
 * Supports both online (admin API) and offline (disk files) modes.
 *
 * @param suiteId - The suite identifier from the URL
 * @returns Suite detail state and actions
 */
export function useSuiteDetail(suiteId: string): SuiteDetailState {
  const status = useServerStore((s) => s.status);
  const serverConfig = useServerStore((s) => s.config);
  const activeProject = useProjectStore(
    (s) => s.projects.find((p) => p.id === s.activeProjectId) ?? null,
  );

  const [routes, setRoutes] = useState<RouteDto[]>([]);
  const [assignments, setAssignments] = useState<SuiteRoutesRecord>({});
  const [activeSuite, setActiveSuite] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isDiskMode, setIsDiskMode] = useState(false);
  const [extendsId, setExtendsId] = useState<string | null>(null);
  const [allSuiteIds, setAllSuiteIds] = useState<string[]>([]);

  const adminApi = useAdminApi();

  /** The mocks directory path relative to project root */
  const mocksPath = serverConfig?.files?.path ?? "mocks";

  // ── Online loading (admin API) ──────────────────────────────────────────

  const loadFromApi = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [allRoutes, { suites, activeSuite: active }] = await Promise.all([
        adminApi.getRoutes(),
        adminApi.getSuites(),
      ]);
      const suite = suites.find((s) => s.id === suiteId);
      setRoutes(allRoutes);
      setAssignments(suite ? suiteArrayToRecord(suite.routes) : {});
      setActiveSuite(active);
      setExtendsId(suite?.extends ?? null);
      setAllSuiteIds(suites.filter((s) => s.id !== suiteId).map((s) => s.id));
      setIsDiskMode(false);
      setIsDirty(false);
    } catch (err: unknown) {
      setError(String(err));
    } finally {
      setIsLoading(false);
    }
  }, [suiteId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Offline loading (disk files) ────────────────────────────────────────

  const loadFromDisk = useCallback(
    async (projectPath: string) => {
      setIsLoading(true);
      setError(null);
      try {
        // 1. Load the suite assignment file
        let suiteAssignments: SuiteRoutesRecord = {};
        try {
          const suiteEntries = await tauriCommands.listDirectory(
            `${projectPath}/${mocksPath}/routesSuites`,
            projectPath,
          );
          const suiteFile = suiteEntries.find(
            (e) => !e.isDirectory && e.name.replace(/\.[^.]+$/, "") === suiteId,
          );
          if (suiteFile) {
            const json = await tauriCommands.evaluateJsFile(
              suiteFile.path,
              projectPath,
            );
            const disk = JSON.parse(json) as DiskSuite;
            suiteAssignments = disk.routes ?? {};
            setExtendsId(disk.extends ?? null);
          }
        } catch (err: unknown) {
          // Suite file may not exist yet — this is expected for new suites
          console.debug("Suite file not found or could not be evaluated:", err);
        }

        // 2. Load all route files
        const diskRoutes: RouteDto[] = [];
        try {
          const routeEntries = await tauriCommands.listDirectory(
            `${projectPath}/${mocksPath}/routes`,
            projectPath,
          );
          const jsFiles = routeEntries.filter(
            (e) => !e.isDirectory && /\.(js|cjs|mjs)$/.test(e.name),
          );
          const results = await Promise.allSettled(
            jsFiles.map((f) =>
              tauriCommands.evaluateJsFile(f.path, projectPath),
            ),
          );
          for (const result of results) {
            if (result.status === "rejected") {
              console.debug("Failed to evaluate route file:", result.reason);
              continue;
            }
            // A route file can export a single route object OR an array of route objects
            const raw = JSON.parse(result.value) as DiskRoute | DiskRoute[];
            const routeArr = Array.isArray(raw) ? raw : [raw];
            for (const disk of routeArr) {
              if (!disk.id || !disk.url || !disk.method) continue; // skip malformed entries
              diskRoutes.push({
                id: disk.id,
                url: disk.url,
                method: disk.method as RouteDto["method"],
                responses: (disk.responses ?? []).map((r) => ({
                  id: r.id,
                  status: r.status,
                  body: r.body,
                  delay: r.delay,
                })),
                selectedResponse: null,
              });
            }
          }
        } catch (err: unknown) {
          // Routes directory may not exist — this is expected for new projects
          console.debug(
            "Routes directory not found or could not be read:",
            err,
          );
        }

        // Deduplicate by route id — if two files define the same id, last one wins (same behaviour as the server)
        const uniqueRoutes = Array.from(
          new Map(diskRoutes.map((r) => [r.id, r])).values(),
        );
        setRoutes(uniqueRoutes);
        setAssignments(suiteAssignments);
        setActiveSuite(serverConfig?.routes?.selectedSuite ?? null);
        // Load all suite IDs (excluding this one) for the Extends selector
        try {
          const allEntries = await tauriCommands.listDirectory(
            `${projectPath}/${mocksPath}/routesSuites`,
            projectPath,
          );
          const otherIds = allEntries
            .filter((e) => !e.isDirectory)
            .map((e) => e.name.replace(/\.[^.]+$/, ""))
            .filter((id) => id !== suiteId);
          setAllSuiteIds(otherIds);
        } catch {
          setAllSuiteIds([]);
        }
        setIsDiskMode(true);
        setIsDirty(false);
      } catch (err: unknown) {
        setError(String(err));
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [suiteId, mocksPath, serverConfig?.routes?.selectedSuite],
  );

  // ── Initial load ────────────────────────────────────────────────────────

  const reload = useCallback(async () => {
    if (status === "running") {
      await loadFromApi();
    } else if (activeProject?.path) {
      await loadFromDisk(activeProject.path);
    } else {
      setIsLoading(false);
      setRoutes([]);
      setAssignments({});
    }
  }, [status, activeProject?.path, loadFromApi, loadFromDisk]);

  useEffect(() => {
    void reload();
  }, [reload]);

  // ── Mutations ───────────────────────────────────────────────────────────

  /** Updates (or removes) the response assignment for a route in this suite. */
  function setRouteResponse(routeId: string, responseId: string | null) {
    setAssignments((prev) => {
      const next = { ...prev };
      if (responseId === null) {
        delete next[routeId];
      } else {
        next[routeId] = responseId;
      }
      return next;
    });
    setIsDirty(true);
  }

  /** Saves the current assignments to the admin API or to disk. */
  async function save() {
    if (isDiskMode) {
      if (!activeProject?.path) return;
      const content = serializeSuiteToDisk(suiteId, assignments, extendsId);
      const suiteFilePath = `${activeProject.path}/${mocksPath}/routesSuites/${suiteId}.js`;
      try {
        await tauriCommands.writeFileContent(
          suiteFilePath,
          content,
          activeProject.path,
        );
        setIsDirty(false);
        setError(null);
      } catch (err: unknown) {
        setError(`Failed to save: ${String(err)}`);
      }
    } else {
      try {
        await adminApi.upsertSuite({
          id: suiteId,
          routes: suiteRecordToArray(assignments),
          extends: extendsId ?? undefined,
        });
        setIsDirty(false);
        setError(null);
      } catch (err: unknown) {
        setError(`Failed to save: ${String(err)}`);
      }
    }
  }

  /** Activates or deactivates this suite (online only). */
  async function toggleActive() {
    if (isDiskMode) return;
    const next = activeSuite === suiteId ? null : suiteId;
    try {
      await adminApi.setActiveSuite(next);
      setActiveSuite(next);
      setError(null);
    } catch (err: unknown) {
      setError(`Failed to change active suite: ${String(err)}`);
    }
  }

  return {
    routes,
    assignments,
    isLoading,
    error,
    isDirty,
    isDiskMode,
    isActiveSuite: activeSuite === suiteId,
    extendsId,
    allSuiteIds,
    setExtendsId: (id: string | null) => {
      setExtendsId(id);
      setIsDirty(true);
    },
    setRouteResponse,
    save,
    toggleActive,
    reload,
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────

/**
 * Serializes suite assignments to a CommonJS module string for writing to disk.
 *
 * @param suiteId - Suite identifier
 * @param assignments - Route → response assignments
 * @returns CommonJS module string
 */
function serializeSuiteToDisk(
  suiteId: string,
  assignments: SuiteRoutesRecord,
  extendsId?: string | null,
): string {
  const extendsLine = extendsId ? `  extends: "${extendsId}",\n` : "";
  const routesEntries = Object.entries(assignments)
    .map(([routeId, responseId]) => `  "${routeId}": "${responseId}",`)
    .join("\n");

  return `module.exports = {\n  id: "${suiteId}",\n${extendsLine}  routes: {\n${routesEntries}\n  },\n};\n`;
}
