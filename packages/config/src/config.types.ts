export type LogLevel =
  | "fatal"
  | "error"
  | "warn"
  | "info"
  | "debug"
  | "trace"
  | "silent";

export interface ConfigType {
  logLevel: LogLevel;
  server: {
    host: string;
    port: number;
  };
  routes: {
    basePath: string;
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
