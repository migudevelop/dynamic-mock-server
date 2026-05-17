import type { Logger as PinoLogger, LogFn } from "pino";
import pino from "pino";

import type { LoggerOptions } from "./logger.types.js";

/**
 * Lightweight Logger wrapper around pino that uses pino-pretty in non-production.
 */
export class Logger {
  private logger: PinoLogger;

  constructor(opts?: LoggerOptions) {
    const level = process.env.LOG_LEVEL ?? opts?.level ?? "info";

    const isDev = process.env.NODE_ENV !== "production";
    let transport: ReturnType<typeof pino.transport> | undefined;
    if (isDev) {
      try {
        transport = pino.transport({
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
            ignore: "pid,hostname",
          },
        });
      } catch {
        // pino-pretty not installed (optional dependency), fall back to JSON logging
      }
    }

    this.logger = pino({ level, ...(opts?.options ?? {}) }, transport);
  }

  /**
   * Create a child logger with additional bindings
   */
  child(bindings?: Record<string, unknown>): Logger {
    const childLogger = this.logger.child(bindings ?? {});
    const wrapper = Object.create(Logger.prototype) as Logger;
    wrapper.logger = childLogger as PinoLogger;
    return wrapper;
  }

  /**
   * Create a namespaced logger (shorthand for child with namespace binding)
   */
  namespace(name: string): Logger {
    return this.child({ namespace: name });
  }

  trace(...args: Parameters<LogFn>) {
    return this.logger.trace(...args);
  }

  debug(...args: Parameters<LogFn>) {
    return this.logger.debug(...args);
  }

  info(...args: Parameters<LogFn>) {
    return this.logger.info(...args);
  }

  warn(...args: Parameters<LogFn>) {
    return this.logger.warn(...args);
  }

  error(...args: Parameters<LogFn>) {
    return this.logger.error(...args);
  }

  fatal(...args: Parameters<LogFn>) {
    return this.logger.fatal(...args);
  }

  setLevel(level: string) {
    try {
      this.logger.level = level;
    } catch (_) {
      // ignore
    }
  }

  get raw(): PinoLogger {
    return this.logger;
  }
}

export default Logger;
