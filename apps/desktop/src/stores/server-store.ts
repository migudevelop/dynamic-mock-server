import { create } from "zustand";

import { tauriCommands } from "@/helpers/tauri-commands";

import type { ProjectConfig } from "@/types/project.types";
import type {
  ServerLogEntry,
  ServerStatus,
  ServerStatusResult,
} from "@/types/server.types";

interface ServerState {
  /** Current server lifecycle status */
  status: ServerStatus;
  /** Current server stats from the admin API */
  statusDetails: ServerStatusResult | null;
  /** Loaded project configuration */
  config: ProjectConfig | null;
  /** Last error message, if status is "error" */
  error: string | null;
  /** Captured log lines from the server process */
  logs: ServerLogEntry[];
}

interface ServerActions {
  /**
   * Starts the mock server for the given project.
   * Transitions: stopped → starting → running (on first successful healthcheck).
   *
   * @param projectPath - Absolute path to the user's project
   */
  startServer: (projectPath: string) => Promise<void>;
  /**
   * Stops the running mock server.
   * Transitions: running → stopping → stopped.
   */
  stopServer: () => Promise<void>;
  /**
   * Polls the server status endpoint and updates state.
   */
  checkStatus: () => Promise<void>;
  /**
   * Loads and parses the project config file.
   *
   * @param projectPath - Absolute path to the user's project
   */
  loadConfig: (projectPath: string) => Promise<void>;
  /**
   * Appends a log entry to the log buffer (capped at MAX_LOGS entries).
   *
   * @param entry - Log entry to add
   */
  addLog: (entry: ServerLogEntry) => void;
  /** Clears all captured log entries. */
  clearLogs: () => void;
  /** Resets the store to its initial state (call when switching projects). */
  reset: () => void;
}

type ServerStore = ServerState & ServerActions;

const initialState: ServerState = {
  status: "stopped",
  statusDetails: null,
  config: null,
  error: null,
  logs: [],
};

/** Maximum number of log entries to retain in memory */
const MAX_LOGS = 500;

/** Poll interval in milliseconds when waiting for the server to start */
const POLL_INTERVAL_MS = 1_000;

/** Maximum time in milliseconds to wait for the server to respond after start */
const START_TIMEOUT_MS = 30_000;

/**
 * Ephemeral store that manages the mock server lifecycle, logs, and config.
 * Not persisted — state resets on page reload.
 */
export const useServerStore = create<ServerStore>()((set, get) => ({
  ...initialState,

  startServer: async (projectPath) => {
    set({ status: "starting", error: null });
    try {
      // Ensure config is loaded before starting
      if (!get().config) {
        await get().loadConfig(projectPath);
      }
      const config = get().config;
      const host = config?.server?.host;
      const rawPort = config?.server?.port;
      const port = rawPort !== undefined ? Number(rawPort) : undefined;

      await tauriCommands.startServer(projectPath, host, port);

      // Poll until the server reports running, or until the timeout expires
      const deadline = Date.now() + START_TIMEOUT_MS;
      while (Date.now() < deadline) {
        await new Promise<void>((resolve) =>
          setTimeout(resolve, POLL_INTERVAL_MS),
        );
        try {
          const result = await tauriCommands.serverStatus();
          if (result.running) {
            set({ status: "running", statusDetails: result, error: null });
            return;
          }
        } catch {
          // Server not ready yet — keep polling
        }
      }

      // Kill the orphaned process so the user can retry without "already running" error
      try {
        await tauriCommands.stopServer();
      } catch {
        /* ignore */
      }
      set({
        status: "error",
        error:
          "Server did not respond within 30 seconds. Check the Console for errors.",
      });
    } catch (err) {
      set({ status: "error", error: String(err) });
    }
  },

  stopServer: async () => {
    set({ status: "stopping" });
    try {
      await tauriCommands.stopServer();
      set({ status: "stopped", statusDetails: null, error: null });
    } catch (err) {
      set({ status: "error", error: String(err) });
    }
  },

  checkStatus: async () => {
    try {
      const result = await tauriCommands.serverStatus();
      if (result.running) {
        set({ status: "running", statusDetails: result, error: null });
      } else {
        const { status } = get();
        // Only transition to stopped if we were already running (not mid-start/stop)
        if (status === "running") {
          set({ status: "stopped", statusDetails: null });
        }
      }
    } catch {
      // Ignore polling errors silently
    }
  },

  loadConfig: async (projectPath) => {
    try {
      const json = await tauriCommands.readConfig(projectPath);
      const config = JSON.parse(json) as ProjectConfig;
      set({ config, error: null });
    } catch (err) {
      set({ error: `Failed to load config: ${String(err)}` });
    }
  },

  addLog: (entry) => {
    set((state) => ({
      logs:
        state.logs.length >= MAX_LOGS
          ? [...state.logs.slice(1), entry]
          : [...state.logs, entry],
    }));
  },

  clearLogs: () => set({ logs: [] }),

  reset: () => set(initialState),
}));
