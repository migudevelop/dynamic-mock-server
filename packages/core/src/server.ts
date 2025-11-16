import fastify, { type FastifyInstance } from "fastify";
import { EventEmitter } from "events";
import type RoutesHandler from "./routes/routes-handler";
import type { Config } from "@dynamic-mock-server/config";
import type { ConfigType } from "@dynamic-mock-server/config";

const DEFAULT_PORT = 3000;

export type ConfigOptions = Pick<ConfigType, "server" | "logLevel">;

export interface ServerOptions {
  config: Config;
  routesHandler?: RoutesHandler;
}

export class Server extends EventEmitter {
  private _config?: Config;
  private _app: FastifyInstance | null = null;
  private _isServerInitialized: boolean = false;
  private _options: ConfigOptions | null = null;
  // private server?: http.Server | https.Server;

  constructor({ config, routesHandler }: ServerOptions) {
    super();
    this._config = config;
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
    this._app.get("/", function (request, reply) {
      reply.send({ hello: "world" });
    });
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
   * Start the underlying HTTP(S) server using Fastify's listen.
   */
  async start(): Promise<void> {
    try {
      await this._initServer();
      await this._app?.listen({
        port: this._options?.server.port,
        host: this._options?.server.host,
      });
      // fastify sets `app.server` to the underlying node server after listen
      // this.server = this._app?.server as http.Server | https.Server;
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
      // this.server = undefined;
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
