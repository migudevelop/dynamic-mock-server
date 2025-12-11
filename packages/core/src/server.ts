import type { FastifyBaseLogger } from "fastify";
import fastify, { type FastifyInstance } from "fastify";
import { EventEmitter } from "events";
import type { Config } from "@dynamic-mock-server/config";
import type { ConfigType } from "@dynamic-mock-server/config";
import type { MocksManager } from "@dynamic-mock-server/mocks-manager";
import type { Logger } from "@dynamic-mock-server/logger";
import { isString } from "@migudevelop/types-utils";
import { isIP } from "net";

export type ConfigOptions = Pick<ConfigType, "server" | "logLevel">;

export interface ServerOptions {
  config: Config;
  mocksManager: MocksManager;
  /** Logger instance for Fastify, or false to disable logging */
  logger?: Logger;
}

export class Server extends EventEmitter {
  private _config?: Config;
  private _mocksManager?: MocksManager;
  private _app: FastifyInstance | null = null;
  private _isServerInitialized: boolean = false;
  private _options: ConfigOptions | null = null;
  private _logger?: Logger;

  constructor({ config, mocksManager, logger }: ServerOptions) {
    super();
    this._config = config;
    this._mocksManager = mocksManager;
    this._logger = logger ?? undefined;
  }

  private async _initServer() {
    if (this._isServerInitialized) return;
    await this._loadConfigOptions();

    // Use the shared logger instance or disable if explicitly set to false
    const fastifyLogger = this._logger
      ? { loggerInstance: this._logger?.raw as FastifyBaseLogger }
      : { logger: false };

    this._app = fastify({
      ...fastifyLogger,
    });

    // Connect MocksManager with Fastify
    if (this._mocksManager) {
      this._mocksManager.setApp(this._app);
    }

    this._isServerInitialized = true;
  }

  private async _loadConfigOptions() {
    if (!this._config) return;
    const configOptions = this._config.getConfig();
    this._options = {
      server: configOptions.server,
      logLevel: configOptions.logLevel,
    };
  }

  getOptions(): ConfigOptions | null {
    return this._options;
  }

  /**
   * Get the Fastify app instance
   */
  getApp(): FastifyInstance | null {
    return this._app;
  }

  /**
   * Get the MocksManager instance
   */
  getMocksManager(): MocksManager | undefined {
    return this._mocksManager;
  }

  /**
   * Start the underlying HTTP(S) server using Fastify's listen.
   */
  async start(): Promise<void> {
    try {
      await this._initServer();
      await this._app?.listen({
        port: this._options?.server.port,
        host: this._options?.server.host,
      });
      this.emit("start", {
        port: this._options?.server.port,
        host: this._options?.server.host,
      });
    } catch (err) {
      this.emit("error", err);
      throw err;
    }
  }

  /**
   * Stop the server if running.
   */
  async stop(): Promise<void> {
    if (!this._app || !this._app.server) return;
    try {
      await this._app.close();
      this.emit("stop");
    } catch (err) {
      this.emit("error", err);
      throw err;
    }
  }

  isLocalhost(host: string): boolean {
    if (!host) return false;

    // Normalize to lowercase and strip IPv6 zone id if present (e.g. fe80::1%lo0)
    const formatedHost = host.toLowerCase().split("%")?.[0] || "";

    // Bind-all addresses
    if (formatedHost === "0.0.0.0" || formatedHost === "::") return true;

    const ver = isIP(formatedHost);
    if (ver === 4) {
      // Any 127.x.x.x is loopback
      return formatedHost.startsWith("127.");
    }

    if (ver === 6) {
      // IPv6 loopback
      if (formatedHost === "::1" || formatedHost === "0:0:0:0:0:0:0:1")
        return true;
      // IPv4-mapped IPv6 (e.g. ::ffff:127.0.0.1)
      if (formatedHost.startsWith("::ffff:")) {
        const mapped = formatedHost.substring("::ffff:".length);
        return isIP(mapped) === 4 && mapped.startsWith("127.");
      }
    }

    return false;
  }

  address(): string | null {
    const s = this._app?.server;
    if (!s) return null;
    const addr = s.address();
    if (!addr) return null;
    if (isString(addr)) return addr;

    let host = addr.address;
    if (this.isLocalhost(host)) {
      host = "localhost";
    }

    return `http://${host}:${addr.port}`;
  }
}
