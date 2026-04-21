import type { LogLevel } from "@/types/config.types";

/** A saved project entry in the multi-project store */
export interface SavedProject {
  /** Unique identifier (timestamp-based) */
  id: string;
  /** Absolute path to the project root directory */
  path: string;
  /** User-facing display label (defaults to directory name) */
  label: string;
  /** Whether the @dynamic-mock-server/cli binary was detected in node_modules */
  cliDetected: boolean;
  /** ISO 8601 date of the last time this project was opened */
  lastOpened: string;
}

/** Config file structure as loaded from dynamicMockServer.config.* */
export interface ProjectConfig {
  /** Logging verbosity level */
  logLevel?: LogLevel;
  /** Plugin configuration */
  plugins?: {
    /** Plugin factories to register */
    register?: unknown[];
  };
  /** Server binding options */
  server?: {
    /** Hostname to bind to (default: "127.0.0.1") */
    host?: string;
    /** Port to listen on (default: 3000) */
    port?: number;
  };
  /** Routes configuration */
  routes?: {
    /** ID of the initially active suite (default: "default") */
    selectedSuite?: string;
  };
  /** File loader configuration */
  files?: {
    /** Whether file loading is enabled (default: true) */
    enabled?: boolean;
    /** Whether hot-reload watching is enabled (default: true) */
    watch?: boolean;
    /** Base directory for mocks files relative to the project root (default: "mocks") */
    path?: string;
  };
}
