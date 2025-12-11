import type { Core } from "@dynamic-mock-server/core";

/**
 * Options for CLI initialization
 */
export interface CLIOptions {
  /** Core instance to interact with */
  core: Core;
  /** Enable colored output */
  colors?: boolean;
}

/**
 * Server status information
 */
export interface ServerStatus {
  /** Whether the server is running */
  running: boolean;
  /** Server URL */
  url?: string;
  /** Active routes suite */
  activeSuite: string | null;
  /** Total routes count */
  totalRoutes: number;
  /** Total responses count */
  totalResponses: number;
  /** Total suites count */
  totalSuites: number;
}
