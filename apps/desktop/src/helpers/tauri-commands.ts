import { invoke } from "@tauri-apps/api/core";

import type {
  AdminRequestPayload,
  AdminResponse,
  ServerLogEntry,
  ServerStatusResult,
  StartServerResult,
} from "@/types/server.types";
import type { FileEntry } from "@/types/route.types";

/**
 * Typed wrappers over all Tauri commands exposed by the Rust backend.
 * Use these instead of raw `invoke()` calls throughout the application.
 */
export const tauriCommands = {
  /**
   * Checks whether the dynamic-mock-server CLI binary exists in the project's node_modules.
   *
   * @param projectPath - Absolute path to the user's project
   * @returns true if the CLI binary is found
   */
  detectCli: (projectPath: string) =>
    invoke<boolean>("detect_cli", { projectPath }),

  /**
   * Evaluates the project's config file via Node.js and returns it as a JSON string.
   *
   * @param projectPath - Absolute path to the user's project
   * @returns JSON string of the resolved configuration
   */
  readConfig: (projectPath: string) =>
    invoke<string>("read_config", { projectPath }),

  /**
   * Starts the mock server as a child process in the given project directory.
   *
   * @param projectPath - Absolute path to the user's project
   * @param host - Optional host to bind (defaults to 127.0.0.1)
   * @param port - Optional port to listen on (defaults to 3000)
   * @returns Start result with success flag and optional PID
   */
  startServer: (projectPath: string, host?: string, port?: number) =>
    invoke<StartServerResult>("start_server", { projectPath, host, port }),

  /**
   * Stops the currently running mock server child process.
   */
  stopServer: () => invoke<void>("stop_server"),

  /**
   * Fetches the server status by calling the /__admin/status endpoint.
   *
   * @returns Server status including running state and stats
   */
  serverStatus: () => invoke<ServerStatusResult>("server_status"),

  /**
   * Returns captured server log entries.
   *
   * @param limit - Maximum number of recent entries to return (default: 100)
   */
  getServerLogs: (limit?: number) =>
    invoke<ServerLogEntry[]>("get_server_logs", { limit }),

  /**
   * Proxies an HTTP request to the running server's admin API.
   * Avoids CORS issues by routing through the Rust backend.
   *
   * @param payload - HTTP method, path, and optional body
   * @returns Status code and response body
   */
  adminRequest: (payload: AdminRequestPayload) =>
    invoke<AdminResponse>("admin_request", { payload }),

  /**
   * Reads the content of a file within the project directory.
   *
   * @param path - Absolute path to the file
   * @param projectPath - Project root for path validation
   * @returns File content as a UTF-8 string
   */
  readFileContent: (path: string, projectPath: string) =>
    invoke<string>("read_file_content", { path, projectPath }),

  /**
   * Writes text content to a file within the project directory.
   *
   * @param path - Absolute path to the file
   * @param content - Text content to write
   * @param projectPath - Project root for path validation
   */
  writeFileContent: (path: string, content: string, projectPath: string) =>
    invoke<void>("write_file_content", { path, content, projectPath }),

  /**
   * Lists entries in a directory within the project.
   *
   * @param path - Absolute path to the directory
   * @param projectPath - Project root for path validation
   * @returns Array of file/directory entries
   */
  listDirectory: (path: string, projectPath: string) =>
    invoke<FileEntry[]>("list_directory", { path, projectPath }),
} as const;
