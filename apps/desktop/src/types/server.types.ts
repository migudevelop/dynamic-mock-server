/** Possible states of the mock server lifecycle */
export type ServerStatus =
  | "stopped"
  | "starting"
  | "running"
  | "stopping"
  | "error";

/** Response from the /__admin/status endpoint */
export interface AdminStatusResponse {
  /** Whether the server is healthy and responding */
  status: "ok";
  /** Total number of registered routes */
  totalRoutes: number;
  /** Total number of responses across all routes */
  totalResponses: number;
  /** Total number of suites */
  totalSuites: number;
  /** Name of the currently active suite, or null if none */
  activeSuite: string | null;
}

/** Payload for a proxied admin API request via Tauri */
export interface AdminRequestPayload {
  /** HTTP method */
  method: "GET" | "POST" | "PUT" | "DELETE";
  /** Path relative to /__admin (e.g. "/routes", "/suites") */
  path: string;
  /** Optional JSON body serialized as string */
  body?: string;
}

/** Response from the admin_request Tauri command */
export interface AdminResponse {
  /** HTTP status code from the mock server */
  statusCode: number;
  /** Response body as a string (may be JSON) */
  body: string;
}

/** Full server status as reported by the server_status Tauri command */
export interface ServerStatusResult {
  /** Whether the server is currently running */
  running: boolean;
  /** Total registered routes (when running) */
  totalRoutes?: number;
  /** Total responses across all routes (when running) */
  totalResponses?: number;
  /** Total suites (when running) */
  totalSuites?: number;
  /** Active suite name (when running) */
  activeSuite?: string | null;
  /** Server host (when running) */
  host?: string;
  /** Server port (when running) */
  port?: number;
}

/** A log entry captured from the server process stdout/stderr */
export interface ServerLogEntry {
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Source stream: "stdout" or "stderr" */
  stream: "stdout" | "stderr";
  /** The log line content */
  message: string;
}

/** Result from the start_server Tauri command */
export interface StartServerResult {
  /** Whether the server started successfully */
  success: boolean;
  /** OS process ID, if available */
  pid?: number;
}
