/**
 * Example usage of the split stores in different scenarios.
 * These components demonstrate how to consume useProjectStore and useServerStore.
 */

import { useCallback, useEffect } from "react";

import { useProjectStore } from "@/stores/project-store";
import { useServerStore } from "@/stores/server-store";

/**
 * Example 1: Display the loaded project configuration.
 */
export function ConfigDisplay() {
  const config = useServerStore((state) => state.config);

  if (!config) {
    return <div>No configuration loaded</div>;
  }

  return (
    <div>
      <h2>Current Configuration</h2>
      <pre>{JSON.stringify(config, null, 2)}</pre>
    </div>
  );
}

/**
 * Example 2: Start/stop the mock server for the active project.
 */
export function ServerControls() {
  const projectPath = useProjectStore(
    (state) => state.projects.find((p) => p.id === state.activeProjectId)?.path ?? null,
  );
  const status = useServerStore((state) => state.status);
  const startServer = useServerStore((state) => state.startServer);
  const stopServer = useServerStore((state) => state.stopServer);

  const isLoading = status === "starting" || status === "stopping";

  const handleStart = useCallback(async () => {
    if (!projectPath) {
      alert("No project selected. Please select a project folder.");
      return;
    }
    try {
      await startServer(projectPath);
    } catch (err) {
      alert(`Error starting server: ${err}`);
    }
  }, [projectPath, startServer]);

  const handleStop = useCallback(async () => {
    try {
      await stopServer();
    } catch (err) {
      alert(`Error stopping server: ${err}`);
    }
  }, [stopServer]);

  return (
    <div>
      <button onClick={handleStart} disabled={!projectPath || isLoading}>
        Start Server
      </button>
      <button onClick={handleStop} disabled={!projectPath || isLoading}>
        Stop Server
      </button>
    </div>
  );
}

/**
 * Example 3: Reload the project configuration from disk.
 */
export function ConfigReloader() {
  const projectPath = useProjectStore(
    (state) => state.projects.find((p) => p.id === state.activeProjectId)?.path ?? null,
  );
  const loadConfig = useServerStore((state) => state.loadConfig);
  const status = useServerStore((state) => state.status);
  const isLoading = status === "starting" || status === "stopping";

  const handleReload = useCallback(async () => {
    if (!projectPath) return;
    try {
      await loadConfig(projectPath);
      alert("Configuration reloaded successfully!");
    } catch (err) {
      alert(`Error reloading configuration: ${err}`);
    }
  }, [projectPath, loadConfig]);

  return (
    <button onClick={handleReload} disabled={!projectPath || isLoading}>
      Reload Configuration
    </button>
  );
}

/**
 * Example 4: React to changes in the active project.
 */
export function ProjectPathWatcher() {
  const projectPath = useProjectStore(
    (state) => state.projects.find((p) => p.id === state.activeProjectId)?.path ?? null,
  );
  const config = useServerStore((state) => state.config);

  useEffect(() => {
    if (projectPath) {
      console.log("Project path changed:", projectPath);
      console.log("Configuration loaded:", config);
    }
  }, [projectPath, config]);

  return null;
}

/**
 * Example 5: Display combined application status.
 */
export function AppStatus() {
  const projectPath = useProjectStore(
    (state) => state.projects.find((p) => p.id === state.activeProjectId)?.path ?? null,
  );
  const config = useServerStore((state) => state.config);
  const status = useServerStore((state) => state.status);
  const error = useServerStore((state) => state.error);

  return (
    <div>
      <h2>Application Status</h2>
      <ul>
        <li>Project Path: {projectPath ?? "Not set"}</li>
        <li>Configuration: {config ? "Loaded" : "Not loaded"}</li>
        <li>Server Status: {status}</li>
        <li>Error: {error ?? "None"}</li>
      </ul>
    </div>
  );
}

/**
 * Example 6: Reset the server and remove the active project.
 */
export function ResetButton() {
  const activeProjectId = useProjectStore((state) => state.activeProjectId);
  const removeProject = useProjectStore((state) => state.removeProject);
  const reset = useServerStore((state) => state.reset);

  const handleReset = useCallback(() => {
    if (confirm("Are you sure you want to reset the application state?")) {
      reset();
      if (activeProjectId) {
        removeProject(activeProjectId);
      }
    }
  }, [activeProjectId, removeProject, reset]);

  return <button onClick={handleReset}>Reset Application</button>;
}
