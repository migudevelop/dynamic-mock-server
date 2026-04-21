import { useCallback, useEffect, useState } from "react";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/shadcn/ui/button";
import SuiteCard from "@/components/suites/suite-card";
import { PageHeader } from "@/components/ui/page-header/page-header";
import { tauriCommands } from "@/helpers/tauri-commands";
import { useAdminApi } from "@/hooks/use-admin-api";
import { useProjectStore } from "@/stores/project-store";
import { useServerStore } from "@/stores/server-store";
import type { SuiteDto } from "@/types/suite.types";

/**
 * Home page displaying the Suites Configuration Overview.
 *
 * - When the server is running: fetches real suite data from the admin API.
 * - When the server is stopped: reads suite file names from disk (read-only mode).
 * Allows activating a suite by toggling the switch on each suite card.
 */
export function Home() {
  const status = useServerStore((s) => s.status);
  const serverConfig = useServerStore((s) => s.config);
  const activeProject = useProjectStore(
    (s) => s.projects.find((p) => p.id === s.activeProjectId) ?? null,
  );

  const [suites, setSuites] = useState<SuiteDto[]>([]);
  const [activeSuite, setActiveSuite] = useState<string | null>(null);
  /** true when suites were read from disk (server offline) */
  const [isDiskMode, setIsDiskMode] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const adminApi = useAdminApi();

  /** Load suites from the admin API (server must be running). */
  const loadSuitesFromApi = useCallback(async () => {
    try {
      const { suites: s, activeSuite: a } = await adminApi.getSuites();
      setSuites(s);
      setActiveSuite(a);
      setIsDiskMode(false);
      setLoadingError(null);
    } catch (err: unknown) {
      setLoadingError(String(err));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** Load suite IDs from disk (server not required). */
  const loadSuitesFromDisk = useCallback(
    async (projectPath: string) => {
      const mocksPath = serverConfig?.files?.path ?? "mocks";
      try {
        const entries = await tauriCommands.listDirectory(
          `${projectPath}/${mocksPath}/routesSuites`,
          projectPath,
        );
        const diskSuites: SuiteDto[] = entries
          .filter((e) => !e.isDirectory)
          .map((e) => ({
            id: e.name.replace(/\.[^.]+$/, ""), // strip extension
            routes: [],
          }));
        setSuites(diskSuites);
        setActiveSuite(null);
        setIsDiskMode(true);
        setLoadingError(null);
      } catch {
        // Directory may not exist yet — show empty state
        setSuites([]);
        setIsDiskMode(true);
        setLoadingError(null);
      }
    },
    [serverConfig?.files?.path],
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

  /** Activates the given suite (or deactivates if it is already active). */
  async function handleToggleActive(suiteId: string) {
    if (isDiskMode) return; // safety guard — switch is already disabled in disk mode
    const nextActive = activeSuite === suiteId ? null : suiteId;
    try {
      await adminApi.setActiveSuite(nextActive);
      setActiveSuite(nextActive);
    } catch (err: unknown) {
      setLoadingError(`Failed to change active suite: ${String(err)}`);
    }
  }

  const isServerRunning = status === "running";

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Suites Configuration Overview"
        description="Manage mock server route suites. Define base behaviours and extend them with specific route overrides."
        actions={
          <Button disabled={!isServerRunning}>
            <PlusIcon className="size-4" />
            New Suite
          </Button>
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
              disabled={isDiskMode}
            />
          ))}
        </section>
      )}
    </div>
  );
}
