import { useCallback, useEffect, useState } from "react";

import { tauriCommands } from "@/helpers/tauri-commands";
import { useAdminApi } from "@/hooks/use-admin-api";
import { useProjectStore } from "@/stores/project-store";
import { useServerStore } from "@/stores/server-store";
import type {
  HttpMethod,
  RouteDto,
  RouteResponseDto,
} from "@/types/route.types";
import { isUndefined } from "types-guards";

/** Raw disk format for a route response */
interface DiskResponse {
  /** Response identifier */
  id: string;
  /** HTTP status code */
  status?: number;
  /** Response body */
  body?: unknown;
  /** Headers to include */
  headers?: Record<string, string>;
  /** Artificial delay in milliseconds */
  delay?: number;
}

/** Raw disk format for a route file */
interface DiskRoute {
  /** Route identifier */
  id: string;
  /** URL path pattern */
  url: string;
  /** HTTP method */
  method: string;
  /** Whether the route is enabled */
  enabled?: boolean;
  /** Available responses */
  responses?: DiskResponse[];
}

export interface RouteDetailState {
  /** The route being edited, or null while loading */
  route: RouteDto | null;
  /** ID of the variant currently displayed in the editor */
  selectedVariantId: string | null;
  /** Whether there are unsaved changes */
  isDirty: boolean;
  /** Whether data is being loaded */
  isLoading: boolean;
  /** Error message if loading or saving failed */
  error: string | null;
  /** Whether we are reading from disk (server offline) */
  isDiskMode: boolean;
  /** Absolute path to the route file on disk (offline mode only) */
  filePath: string | null;
  /** Selects a variant to display in the editor */
  setSelectedVariant: (variantId: string) => void;
  /** Updates a top-level field of the route (id, url, method, enabled) */
  setRouteField: <
    K extends keyof Pick<RouteDto, "id" | "url" | "method" | "enabled">,
  >(
    field: K,
    value: RouteDto[K],
  ) => void;
  /** Updates a field on a specific response variant */
  setVariantField: <K extends keyof RouteResponseDto>(
    variantId: string,
    field: K,
    value: RouteResponseDto[K],
  ) => void;
  /** Renames a variant and keeps the selected variant ID in sync */
  renameVariant: (oldId: string, newId: string) => void;
  /** Adds a new empty response variant */
  addVariant: () => void;
  /** Duplicates an existing response variant */
  duplicateVariant: (variantId: string) => void;
  /** Removes a response variant */
  removeVariant: (variantId: string) => void;
  /** Persists the current route state */
  save: () => Promise<void>;
  /** Deletes the route (online only) */
  deleteRoute: () => Promise<void>;
  /** Reloads data from the current source */
  reload: () => Promise<void>;
}

/**
 * Manages data fetching and mutations for the route detail page.
 * Supports both online (admin API) and offline (disk files) modes.
 *
 * @param routeId - The route identifier from the URL
 * @returns Route detail state and actions
 */
export function useRouteDetail(
  routeId: string,
  initialVariantId?: string | null,
): RouteDetailState {
  const status = useServerStore((s) => s.status);
  const serverConfig = useServerStore((s) => s.config);
  const activeProject = useProjectStore(
    (s) => s.projects.find((p) => p.id === s.activeProjectId) ?? null,
  );

  const [route, setRoute] = useState<RouteDto | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isDiskMode, setIsDiskMode] = useState(false);
  const [filePath, setFilePath] = useState<string | null>(null);

  const adminApi = useAdminApi();
  const mocksPath = serverConfig?.files?.path ?? "mocks";

  // ── Online loading ──────────────────────────────────────────────────────

  const loadFromApi = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const allRoutes = await adminApi.getRoutes();
      const found = allRoutes.find((r) => r.id === routeId) ?? null;
      setRoute(found);
      const validInitial = found?.responses.find(
        (r) => r.id === initialVariantId,
      );
      setSelectedVariantId(validInitial?.id ?? found?.responses[0]?.id ?? null);
      setIsDiskMode(false);
      setFilePath(null);
      setIsDirty(false);
    } catch (err: unknown) {
      setError(String(err));
    } finally {
      setIsLoading(false);
    }
  }, [routeId, initialVariantId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Offline loading ─────────────────────────────────────────────────────

  const loadFromDisk = useCallback(
    async (projectPath: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const routeEntries = await tauriCommands.listDirectory(
          `${projectPath}/${mocksPath}/routes`,
          projectPath,
        );
        const jsFiles = routeEntries.filter(
          (e) => !e.isDirectory && /\.(js|cjs|mjs)$/.test(e.name),
        );

        let found: RouteDto | null = null;
        let foundPath: string | null = null;

        for (const file of jsFiles) {
          if (found) break;
          try {
            const json = await tauriCommands.evaluateJsFile(
              file.path,
              projectPath,
            );
            const raw = JSON.parse(json) as DiskRoute | DiskRoute[];
            const arr = Array.isArray(raw) ? raw : [raw];
            const match = arr.find((r) => r.id === routeId);
            if (match) {
              found = {
                id: match.id,
                url: match.url,
                method: match.method as HttpMethod,
                enabled: match.enabled,
                responses: (match.responses ?? []).map((r) => ({
                  id: r.id,
                  status: r.status,
                  body: r.body,
                  headers: r.headers,
                  delay: r.delay,
                })),
                selectedResponse: null,
              };
              foundPath = file.path;
            }
          } catch {
            // skip unreadable file
          }
        }

        setRoute(found);
        const validInitial = found?.responses.find(
          (r) => r.id === initialVariantId,
        );
        setSelectedVariantId(
          validInitial?.id ?? found?.responses[0]?.id ?? null,
        );
        setFilePath(foundPath);
        setIsDiskMode(true);
        setIsDirty(false);
      } catch (err: unknown) {
        setError(String(err));
      } finally {
        setIsLoading(false);
      }
    },
    [routeId, mocksPath, initialVariantId],
  );

  // ── Initial load ────────────────────────────────────────────────────────

  const reload = useCallback(async () => {
    if (status === "running") {
      await loadFromApi();
    } else if (activeProject?.path) {
      await loadFromDisk(activeProject.path);
    } else {
      setIsLoading(false);
      setRoute(null);
    }
  }, [status, activeProject?.path, loadFromApi, loadFromDisk]);

  useEffect(() => {
    void reload();
  }, [reload]);

  // ── Mutations ───────────────────────────────────────────────────────────

  function setSelectedVariant(variantId: string) {
    setSelectedVariantId(variantId);
  }

  function setRouteField<
    K extends keyof Pick<RouteDto, "id" | "url" | "method" | "enabled">,
  >(field: K, value: RouteDto[K]) {
    setRoute((prev) => (prev ? { ...prev, [field]: value } : prev));
    setIsDirty(true);
  }

  function setVariantField<K extends keyof RouteResponseDto>(
    variantId: string,
    field: K,
    value: RouteResponseDto[K],
  ) {
    setRoute((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        responses: prev.responses.map((r) =>
          r.id === variantId ? { ...r, [field]: value } : r,
        ),
      };
    });
    setIsDirty(true);
  }

  function addVariant() {
    const newId = `variant-${Date.now()}`;
    const newVariant: RouteResponseDto = {
      id: newId,
      status: 200,
      body: {},
      delay: 0,
    };
    setRoute((prev) => {
      if (!prev) return prev;
      return { ...prev, responses: [...prev.responses, newVariant] };
    });
    setSelectedVariantId(newId);
    setIsDirty(true);
  }

  function duplicateVariant(variantId: string) {
    setRoute((prev) => {
      if (!prev) return prev;
      const source = prev.responses.find((r) => r.id === variantId);
      if (!source) return prev;
      const copy: RouteResponseDto = {
        ...source,
        id: `${variantId}-copy-${Date.now()}`,
      };
      const idx = prev.responses.findIndex((r) => r.id === variantId);
      const next = [...prev.responses];
      next.splice(idx + 1, 0, copy);
      setSelectedVariantId(copy.id);
      return { ...prev, responses: next };
    });
    setIsDirty(true);
  }

  function removeVariant(variantId: string) {
    setRoute((prev) => {
      if (!prev) return prev;
      const filtered = prev.responses.filter((r) => r.id !== variantId);
      if (selectedVariantId === variantId) {
        setSelectedVariantId(filtered[0]?.id ?? null);
      }
      return { ...prev, responses: filtered };
    });
    setIsDirty(true);
  }

  function renameVariant(oldId: string, newId: string) {
    setRoute((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        responses: prev.responses.map((r) =>
          r.id === oldId ? { ...r, id: newId } : r,
        ),
      };
    });
    setSelectedVariantId((prev) => (prev === oldId ? newId : prev));
    setIsDirty(true);
  }

  /** Serializes the current route state to a CommonJS module string. */
  function serializeRouteToDisk(r: RouteDto): string {
    const obj = {
      id: r.id,
      url: r.url,
      method: r.method,
      ...(r.enabled === false ? { enabled: false } : {}),
      responses: r.responses.map((resp) => {
        const entry: Record<string, unknown> = { id: resp.id };
        if (resp.status != null) entry.status = resp.status;
        if (resp.delay != null && resp.delay > 0) entry.delay = resp.delay;
        if (resp.headers && Object.keys(resp.headers).length > 0)
          entry.headers = resp.headers;
        if (!isUndefined(resp.body)) entry.body = resp.body;
        return entry;
      }),
    };
    return `module.exports = ${JSON.stringify(obj, null, 2)};\n`;
  }

  async function save() {
    if (!route) return;
    if (isDiskMode) {
      if (!activeProject?.path || !filePath) {
        setError("Cannot save: file path unknown.");
        return;
      }
      try {
        const content = serializeRouteToDisk(route);
        await tauriCommands.writeFileContent(
          filePath,
          content,
          activeProject.path,
        );
        setIsDirty(false);
        setError(null);
      } catch (err: unknown) {
        throw new Error(`Failed to save: ${String(err)}`);
      }
    } else {
      try {
        await adminApi.upsertRoute({
          id: route.id,
          url: route.url,
          method: route.method,
          enabled: route.enabled,
          responses: route.responses,
        });
        setIsDirty(false);
        setError(null);
      } catch (err: unknown) {
        throw new Error(`Failed to save: ${String(err)}`);
      }
    }
  }

  async function deleteRoute() {
    if (!route) return;
    if (isDiskMode) {
      setError("Delete is only available when the server is running.");
      return;
    }
    await adminApi.removeRoute(route.id);
  }

  return {
    route,
    selectedVariantId,
    isDirty,
    isLoading,
    error,
    isDiskMode,
    filePath,
    setSelectedVariant,
    setRouteField,
    setVariantField,
    addVariant,
    duplicateVariant,
    removeVariant,
    renameVariant,
    save,
    deleteRoute,
    reload,
  };
}
