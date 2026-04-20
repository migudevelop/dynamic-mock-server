/**
 * Example usage of the app store in different scenarios
 */

import { useCallback, useEffect } from "react";

import { useAppStore } from "@/stores";

/**
 * Example 1: Access the current configuration
 */
export function ConfigDisplay() {
  const config = useAppStore((state) => state.config);

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
 * Example 2: Use Tauri commands to start/stop the server
 * Note: Tauri commands need to be implemented in the Rust backend first
 */
export function ServerControls() {
  const projectPath = useAppStore((state) => state.projectPath);
  const isLoading = useAppStore((state) => state.isLoading);

  const handleStart = useCallback(async () => {
    if (!projectPath) {
      alert("No project selected. Please select a project folder.");
      return;
    }

    try {
      // TODO: Implement Tauri command
      // await invoke("start_server");
      alert(
        "Server start command not implemented yet. See TAURI_ARCHITECTURE.md",
      );
    } catch (error) {
      alert(`Error starting server: ${error}`);
    }
  }, [projectPath]);

  const handleStop = useCallback(async () => {
    if (!projectPath) {
      return;
    }

    try {
      // TODO: Implement Tauri command
      // await invoke("stop_server");
      alert(
        "Server stop command not implemented yet. See TAURI_ARCHITECTURE.md",
      );
    } catch (error) {
      alert(`Error stopping server: ${error}`);
    }
  }, [projectPath]);

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
 * Example 3: Reload configuration when needed
 */
export function ConfigReloader() {
  const reloadConfig = useAppStore((state) => state.reloadConfig);
  const projectPath = useAppStore((state) => state.projectPath);
  const isLoading = useAppStore((state) => state.isLoading);

  const handleReload = useCallback(async () => {
    try {
      await reloadConfig();
      alert("Configuration reloaded successfully!");
    } catch (error) {
      alert(`Error reloading configuration: ${error}`);
    }
  }, [reloadConfig]);

  return (
    <button onClick={handleReload} disabled={!projectPath || isLoading}>
      Reload Configuration
    </button>
  );
}

/**
 * Example 4: React to changes in the store
 */
export function ProjectPathWatcher() {
  const projectPath = useAppStore((state) => state.projectPath);
  const config = useAppStore((state) => state.config);

  useEffect(() => {
    if (projectPath) {
      console.log("Project path changed:", projectPath);
      console.log("Configuration loaded:", config);
    }
  }, [projectPath, config]);

  return null;
}

/**
 * Example 5: Access multiple store values at once
 */
export function AppStatus() {
  const { projectPath, config, isLoading, error } = useAppStore((state) => ({
    projectPath: state.projectPath,
    config: state.config,
    isLoading: state.isLoading,
    error: state.error,
  }));

  return (
    <div>
      <h2>Application Status</h2>
      <ul>
        <li>Project Path: {projectPath || "Not set"}</li>
        <li>Configuration: {config ? "Loaded" : "Not loaded"}</li>
        <li>Loading: {isLoading ? "Yes" : "No"}</li>
        <li>Error: {error || "None"}</li>
      </ul>
    </div>
  );
}

/**
 * Example 6: Clear state (useful for logout or reset functionality)
 */
export function ResetButton() {
  const clearState = useAppStore((state) => state.clearState);

  const handleReset = useCallback(() => {
    if (confirm("Are you sure you want to reset the application state?")) {
      clearState();
    }
  }, [clearState]);

  return <button onClick={handleReset}>Reset Application</button>;
}
