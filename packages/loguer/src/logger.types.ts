import type { LoggerOptions as PinoLoggerOptions } from "pino";

export type LogLevel =
  | "fatal"
  | "error"
  | "warn"
  | "info"
  | "debug"
  | "trace"
  | "silent";

/**
 * Options to configure the logger.
 */
export interface LoggerOptions {
  /** Log level (trace|debug|info|warn|error|fatal) */
  level?: LogLevel;
  /** Additional pino options passed through to pino constructor */
  pinoOptions?: PinoLoggerOptions;
  /** Namespace for the logger */
  namespace?: string;
}
