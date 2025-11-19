import fastify, { type FastifyInstance } from "fastify";
import { EventEmitter } from "events";
import type { Config } from "@dynamic-mock-server/config";
import type { ConfigType } from "@dynamic-mock-server/config";
import type { MocksManager } from "@dynamic-mock-server/mocks-manager";

export type ConfigOptions = Pick<ConfigType, "server" | "logLevel">;

export interface ServerOptions {
  config: Config;
  mocksManager: MocksManager;
}

export class Server extends EventEmitter {
  private _config?: Config;
  private _mocksManager?: MocksManager;
  private _app: FastifyInstance | null = null;
  private _isServerInitialized: boolean = false;
  private _options: ConfigOptions | null = null;

  constructor({ config, mocksManager }: ServerOptions) {
    super();
    this._config = config;
    this._mocksManager = mocksManager;
  }

  private async _initServer() {
    if (this._isServerInitialized) return;
    await this._loadConfigOptions();
    this._app = fastify({
      logger: {
        level: process.env.LOG_LEVEL ?? this._options?.logLevel,
        transport: {
          target: "pino-pretty",
          options: { colorize: true },
        },
      },
    });

    // Connect MocksManager with Fastify
    if (this._mocksManager) {
      this._mocksManager.setApp(this._app);
    }

    this._isServerInitialized = true;
  }

  private async _loadConfigOptions() {
    if (!this._config) return;
    const configOptions = await this._config.getConfig();
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

  address(): string | null {
    const s = this._app?.server;
    if (!s) return null;
    const addr = s.address();
    if (!addr) return null;
    if (typeof addr === "string") return addr;
    return `http://${addr.address}:${addr.port}`;
  }
}
