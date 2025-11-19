import pino, { Logger as PinoLogger } from "pino";
import type { LoggerOptions } from "./logger.types";

/**
 * Lightweight Logger wrapper around pino that uses pino-pretty in non-production.
 */
export class Logger {
  private logger: PinoLogger;

  constructor(opts?: LoggerOptions) {
    const level = opts?.level ?? process.env.LOG_LEVEL ?? "info";

    const transport = pino.transport({
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
    });

    this.logger = pino({ level, ...(opts?.pinoOptions ?? {}) }, transport);
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

  trace(...args: any[]) {}

  debug(...args: any[]) {
    return (this.logger.debug as any)(...args);
  }

  info(...args: any[]) {
    return (this.logger.info as any)(...args);
  }

  warn(...args: any[]) {
    return (this.logger.warn as any)(...args);
  }

  error(...args: any[]) {
    return (this.logger.error as any)(...args);
  }

  fatal(...args: any[]) {
    return (this.logger.fatal as any)(...args);
  }

  setLevel(level: string) {
    try {
      (this.logger as any).level = level;
    } catch (_) {
      // ignore
    }
  }

  get raw(): PinoLogger {
    return this.logger;
  }
}

export default Logger;
