import { Server } from "./server.js";
import { Config } from "@dynamic-mock-server/config";
import { Logger } from "@dynamic-mock-server/logger";
import { Alerts } from "@dynamic-mock-server/alerts";
import { MocksManager } from "@dynamic-mock-server/mocks-manager";
import { PluginManager } from "./plugins-manager.js";
import type { CoreApi } from "./plugins-manager.types.js";
import type { CoreOptions } from "./core.types.js";

/**
 * Core is the main orchestrator for the mock server.
 * It manages configuration, server, plugins, alerts, and logging.
 */
export class Core {
  private _server: Server;
  private _config: Config;
  private _logger: Logger;
  private _alerts: Alerts;
  private _mocksManager: MocksManager;
  private _pluginManager: PluginManager;
  private _version = "0.0.1-beta"; // TODO: read from package.json

  constructor(options?: CoreOptions) {
    // Initialize core systems
    this._config = new Config();
    const logLevel = this._config.getConfig().logLevel;
    this._logger = options?.logger
      ? options.logger
      : new Logger({ level: logLevel });
    this._alerts = new Alerts();
    this._mocksManager = new MocksManager({
      config: this._config,
      logger: this._logger,
      alerts: this._alerts,
    });

    // Initialize server
    this._server = new Server({
      config: this._config,
      mocksManager: this._mocksManager,
      logger: this._logger,
    });

    // Create Core API for plugins
    const coreApi: CoreApi = {
      config: this._config,
      logger: this._logger,
      alerts: this._alerts,
      mocksManager: this._mocksManager,
      server: this._server,
      version: this._version,
    };

    // Initialize plugin manager
    this._pluginManager = new PluginManager(coreApi, this, options?.plugins);
  }

  /**
   * Initialize the core and all plugins
   */
  async init(): Promise<void> {
    // Load configuration (available via this._config.getConfig())
    this._config.getConfig();

    // Initialize mocks manager (loads files if configured)
    await this._mocksManager.init();

    // Initialize plugin manager (will load plugins from config + options)
    await this._pluginManager.init();
  }

  /**
   * Start the server and all plugins
   */
  async start(): Promise<void> {
    await this.init();
    await this._server.start();
    await this._mocksManager.start();
    await this._pluginManager.start();
  }

  /**
   * Stop the server and all plugins
   */
  async stop(): Promise<void> {
    await this._pluginManager.stop();
    await this._mocksManager.stop();
    await this._server.stop();
  }

  // Getters for accessing core systems

  get server(): Server {
    return this._server;
  }

  get config(): Config {
    return this._config;
  }

  get logger(): Logger {
    return this._logger;
  }

  get alerts(): Alerts {
    return this._alerts;
  }

  get mocksManager(): MocksManager {
    return this._mocksManager;
  }

  get version(): string {
    return this._version;
  }

  get plugins(): PluginManager {
    return this._pluginManager;
  }
}
