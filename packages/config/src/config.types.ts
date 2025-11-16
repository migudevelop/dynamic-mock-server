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
}
