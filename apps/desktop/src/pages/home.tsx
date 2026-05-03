import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useCallback, useEffect, useState } from "react";
import { PlusIcon, SaveIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import SuiteCard from "@/components/suites/suite-card";
import { PageHeader } from "@/components/ui/page-header/page-header";
import { cn } from "@/helpers/shadcn/utils";
import { tauriCommands } from "@/helpers/tauri-commands";
import { useAdminApi } from "@/hooks/use-admin-api";
import { useProjectStore } from "@/stores/project-store";
import { useServerStore } from "@/stores/server-store";
import type { SuiteDto } from "@/types/suite.types";

/** Config file names to search in the project root */
const CONFIG_CANDIDATES = [
  "dynamicMockServer.config.js",
  "dynamicMockServer.config.cjs",
  "dynamicMockServer.config.mjs",
  "dynamicMockServer.config.ts",
  "dynamicMockServer.config.json",
];

/**
 * Finds the config file, updates selectedSuite with the given value, and writes it back.
 * Supports the most common patterns: key with double/single/template quotes or null/undefined.
 */
async function updateConfigSelectedSuite(
  projectPath: string,
  suiteId: string | null,
): Promise<void> {
  let configPath: string | null = null;
  let content = "";

  for (const name of CONFIG_CANDIDATES) {
    try {
      const path = `${projectPath}/${name}`;
      content = await tauriCommands.readFileContent(path, projectPath);
      configPath = path;
      break;
    } catch {
      // not found, try next
    }
  }

  if (!configPath) throw new Error("Config file not found");

  const newValue = suiteId ? `"${suiteId}"` : "null";

  // Try to replace an existing selectedSuite value
  const updated = content.replace(
    /selectedSuite\s*:\s*(?:"[^"]*"|'[^']*'|`[^`]*`|\bnull\b|\bundefined\b)/,
    `selectedSuite: ${newValue}`,
  );

  if (updated !== content) {
    await tauriCommands.writeFileContent(configPath, updated, projectPath);
    return;
  }

  // selectedSuite not present — insert into routes section
  const routesInserted = content.replace(
    /(routes\s*:\s*\{)/,
    `$1\n    selectedSuite: ${newValue},`,
  );

  if (routesInserted !== content) {
    await tauriCommands.writeFileContent(
      configPath,
      routesInserted,
      projectPath,
    );
    return;
  }

  throw new Error(
    "Cannot update selectedSuite: routes section not found in config",
  );
}

/**
 * Home page displaying the Suites Configuration Overview.
 *
 * - When the server is running: fetches real suite data from the admin API.
 * - When the server is stopped: reads suite file names from disk.
 * The active suite (selectedSuite) can be changed and saved to the config file
 * regardless of whether the server is running.
 */
export function Home() {
  const status = useServerStore((s) => s.status);
  const serverConfig = useServerStore((s) => s.config);
  const loadConfig = useServerStore((s) => s.loadConfig);
  const activeProject = useProjectStore(
    (s) => s.projects.find((p) => p.id === s.activeProjectId) ?? null,
  );

  const [suites, setSuites] = useState<SuiteDto[]>([]);
  const [activeSuite, setActiveSuite] = useState<string | null>(null);
  const [isDiskMode, setIsDiskMode] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isDirtySelected, setIsDirtySelected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // Map from suite ID to its absolute file path (only populated in disk mode)
  const [suiteFilePaths, setSuiteFilePaths] = useState<Map<string, string>>(
    new Map(),
  );

  // New suite dialog state
  const [newSuiteDialogOpen, setNewSuiteDialogOpen] = useState(false);
  const [newSuiteName, setNewSuiteName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const adminApi = useAdminApi();

  const loadSuitesFromApi = useCallback(async () => {
    try {
      const { suites: s, activeSuite: a } = await adminApi.getSuites();
      setSuites(s);
      setActiveSuite(a);
      setIsDiskMode(false);
      setIsDirtySelected(false);
      setLoadingError(null);
    } catch (err: unknown) {
      setLoadingError(String(err));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadSuitesFromDisk = useCallback(
    async (projectPath: string) => {
      const mocksPath = serverConfig?.files?.path ?? "mocks";
      try {
        const entries = await tauriCommands.listDirectory(
          `${projectPath}/${mocksPath}/routesSuites`,
          projectPath,
        );
        const jsEntries = entries.filter((e) => !e.isDirectory);

        const pathMap = new Map<string, string>();
        const diskSuites: SuiteDto[] = await Promise.all(
          jsEntries.map(async (e) => {
            const fallbackId = e.name.replace(/\.[^.]+$/, "");
            try {
              const json = await tauriCommands.evaluateJsFile(
                e.path,
                projectPath,
              );
              const disk = JSON.parse(json) as {
                id?: string;
                routes?: Record<string, string>;
                extends?: string;
              };
              const suiteId = disk.id ?? fallbackId;
              pathMap.set(suiteId, e.path);
              const routeEntries = Object.entries(disk.routes ?? {}).map(
                ([k, v]) => `${k}:${v}`,
              );
              return {
                id: suiteId,
                routes: routeEntries,
                extends: disk.extends,
              };
            } catch {
              pathMap.set(fallbackId, e.path);
              return { id: fallbackId, routes: [] };
            }
          }),
        );

        setSuites(diskSuites);
        setSuiteFilePaths(pathMap);
        // Initialize from config's selectedSuite
        setActiveSuite(serverConfig?.routes?.selectedSuite ?? null);
        setIsDiskMode(true);
        setIsDirtySelected(false);
        setLoadingError(null);
      } catch {
        setSuites([]);
        setSuiteFilePaths(new Map());
        setActiveSuite(serverConfig?.routes?.selectedSuite ?? null);
        setIsDiskMode(true);
        setIsDirtySelected(false);
        setLoadingError(null);
      }
    },
    [serverConfig?.files?.path, serverConfig?.routes?.selectedSuite],
  );

  useEffect(() => {
    if (status === "running") {
      void loadSuitesFromApi();
      return;
    }
    if (activeProject?.path) {
      void loadSuitesFromDisk(activeProject.path);
      return;
    }
    setSuites([]);
    setActiveSuite(null);
    setIsDiskMode(false);
  }, [status, activeProject?.path, loadSuitesFromApi, loadSuitesFromDisk]);

  async function handleToggleActive(suiteId: string) {
    // Radio behavior: clicking the already-active suite does nothing
    if (activeSuite === suiteId) return;
    const nextActive = suiteId;

    if (!isDiskMode) {
      try {
        await adminApi.setActiveSuite(nextActive);
        setActiveSuite(nextActive);
        setIsDirtySelected(true);
      } catch (err: unknown) {
        setLoadingError(`Failed to change active suite: ${String(err)}`);
      }
    } else {
      setActiveSuite(nextActive);
      setIsDirtySelected(true);
    }
  }

  async function handleSaveSelectedSuite() {
    if (!activeProject?.path) return;
    setIsSaving(true);
    try {
      await updateConfigSelectedSuite(activeProject.path, activeSuite);
      await loadConfig(activeProject.path);
      setIsDirtySelected(false);
      toast.success("Configuration saved.");
    } catch (err: unknown) {
      setLoadingError(`Failed to save config: ${String(err)}`);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddSuite() {
    const name = newSuiteName.trim();
    if (!name || !activeProject?.path) return;
    setIsCreating(true);
    const mocksPath = serverConfig?.files?.path ?? "mocks";
    try {
      const content = `module.exports = {\n  id: "${name}",\n  routes: {},\n};\n`;
      const filePath = `${activeProject.path}/${mocksPath}/routesSuites/${name}.js`;
      await tauriCommands.writeFileContent(
        filePath,
        content,
        activeProject.path,
      );

      setSuites((prev) => [...prev, { id: name, routes: [] }]);
      setSuiteFilePaths((prev) => new Map(prev).set(name, filePath));

      if (!isDiskMode) {
        await adminApi.upsertSuite({ id: name, routes: [] });
      }

      setNewSuiteName("");
      setNewSuiteDialogOpen(false);
      toast.success(`Suite "${name}" created.`);
    } catch (err: unknown) {
      setLoadingError(`Failed to create suite: ${String(err)}`);
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDeleteSuite(suiteId: string) {
    if (!activeProject?.path) return;

    try {
      // Remove from API if online
      if (!isDiskMode) {
        await adminApi.removeSuite(suiteId);
      }

      // Delete file from disk if we know its path
      const filePath = suiteFilePaths.get(suiteId);
      if (filePath) {
        try {
          await tauriCommands.deleteFile(filePath, activeProject.path);
        } catch {
          // File deletion is best-effort; ignore if already gone
        }
      }

      // Remove from local state
      setSuites((prev) => prev.filter((s) => s.id !== suiteId));
      setSuiteFilePaths((prev) => {
        const next = new Map(prev);
        next.delete(suiteId);
        return next;
      });

      // If the deleted suite was active, clear selection and mark dirty
      if (activeSuite === suiteId) {
        setActiveSuite(null);
        setIsDirtySelected(true);
      }

      toast.success(`Suite "${suiteId}" deleted.`);
    } catch (err: unknown) {
      setLoadingError(`Failed to delete suite: ${String(err)}`);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Suites Configuration Overview"
        description="Manage mock server route suites. Define base behaviours and extend them with specific route overrides."
        actions={
          <div className="flex items-center gap-2">
            {isDirtySelected && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => void handleSaveSelectedSuite()}
                disabled={isSaving}
              >
                <SaveIcon className="size-4" />
                Save
              </Button>
            )}
            <Button
              onClick={() => setNewSuiteDialogOpen(true)}
              disabled={!activeProject}
            >
              <PlusIcon className="size-4" />
              New Suite
            </Button>
          </div>
        }
      />

      {loadingError && (
        <p className="text-sm text-destructive">Error: {loadingError}</p>
      )}

      {!activeProject && (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-2">
          <p className="text-lg font-medium">No project selected</p>
          <p className="text-sm">Select a project to view its suites.</p>
        </div>
      )}

      {activeProject && suites.length === 0 && (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <p className="text-sm">
            {isDiskMode
              ? "No suite files found in the mocks/routesSuites directory."
              : "No suites registered yet."}
          </p>
        </div>
      )}

      {activeProject && suites.length > 0 && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {suites.map((suite) => (
            <SuiteCard
              key={suite.id}
              suite={suite}
              isActive={activeSuite === suite.id}
              onToggleActive={() => void handleToggleActive(suite.id)}
              onDelete={() => void handleDeleteSuite(suite.id)}
            />
          ))}
        </section>
      )}

      {/* New Suite Dialog */}
      <DialogPrimitive.Root
        open={newSuiteDialogOpen}
        onOpenChange={(open) => {
          setNewSuiteDialogOpen(open);
          if (!open) setNewSuiteName("");
        }}
      >
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content
            className={cn(
              "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
              "w-full max-w-sm flex flex-col",
              "bg-background rounded-lg shadow-xl border border-border",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
              "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
              "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
              "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-border">
              <div>
                <DialogPrimitive.Title className="text-base font-semibold text-foreground">
                  New Suite
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="text-sm text-muted-foreground mt-0.5">
                  Enter an ID for the new suite.
                </DialogPrimitive.Description>
              </div>
              <DialogPrimitive.Close asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 -mt-1 -mr-2"
                >
                  <XIcon className="size-4" />
                </Button>
              </DialogPrimitive.Close>
            </div>

            {/* Body */}
            <div className="px-6 py-5 flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="new-suite-name">Suite ID</Label>
                <Input
                  id="new-suite-name"
                  value={newSuiteName}
                  onChange={(e) => setNewSuiteName(e.target.value)}
                  placeholder="e.g. base, errors, happy-path"
                  className="font-mono"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleAddSuite();
                  }}
                  autoFocus
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 px-6 pb-6">
              <DialogPrimitive.Close asChild>
                <Button variant="outline" size="sm">
                  Cancel
                </Button>
              </DialogPrimitive.Close>
              <Button
                size="sm"
                onClick={() => void handleAddSuite()}
                disabled={!newSuiteName.trim() || isCreating}
              >
                Create
              </Button>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  );
}
