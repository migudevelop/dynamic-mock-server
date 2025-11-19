export type LogLevel =
  | "fatal"
  | "error"
  | "warn"
  | "info"
  | "debug"
  | "trace"
  | "silent";

export interface ConfigType {
  /** The logging level */
  logLevel: LogLevel;
  server: {
    /** The host for the server */
    host: string;
    /** The port number for the server */
    port: number;
  };
  routes: {
    /** The selected routes-suite */
    selectedSuite: string;
  };
  files: {
    /** Enable file loading system */
    enabled: boolean;
    /** Watch files for changes and hot-reload */
    watch: boolean;
    /** Base path for mock files */
    path: string;
  };
}
