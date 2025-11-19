import { loadConfig } from "unconfig";
import { watch, type FSWatcher } from "chokidar";
import { join } from "path";
import type { Config } from "@dynamic-mock-server/config";
import type { MocksManager } from "./mocks-manager";
import type { RouteConfig, RoutesSuite } from "./mocks-manager.types";
import type {
  RouteDefinition,
  RoutesSuiteDefinition,
} from "./files-loader.types";

/**
 * Minimal logger interface for FilesLoader
 */
export interface MinimalLogger {
  /** Log info message */
  info(message: string): void;
  /** Log warning message */
  warn(message: string): void;
  /** Log error message */
  error(message: string): void;
  /** Create namespaced logger */
  namespace(name: string): MinimalLogger;
}

/**
 * Minimal alerts interface for FilesLoader
 */
export interface MinimalAlerts {
  /** Set an alert */
  set(id: string, message: string): void;
  /** Remove an alert */
  remove(id: string): void;
  /** Create alert collection */
  collection(name: string): MinimalAlerts;
}

/**
 * Options for FilesLoader
 */
export interface FilesLoaderOptions {
  /** Configuration instance */
  config: Config;
  /** Logger instance */
  logger: MinimalLogger;
  /** Alerts instance */
  alerts: MinimalAlerts;
  /** MocksManager instance */
  mocksManager: MocksManager;
}

/**
 * FilesLoader manages loading of mock files (routes and suites) with hot-reload support.
 * Uses unconfig for robust file loading and chokidar for watching.
 */
export class FilesLoader {
  static readonly id = "files";

  private readonly _config: Config;
  private readonly _logger: MinimalLogger;
  private readonly _alerts: MinimalAlerts;
  private readonly _mocksManager: MocksManager;
  private _routesWatcher?: FSWatcher;
  private _suitesWatcher?: FSWatcher;
  private _enabled: boolean = true;
  private _watch: boolean = true;
  private _basePath: string = "mocks";

  constructor(options: FilesLoaderOptions) {
    this._config = options.config;
    this._logger = options.logger.namespace(FilesLoader.id);
    this._alerts = options.alerts.collection(FilesLoader.id);
    this._mocksManager = options.mocksManager;
  }

  /**
   * Initialize and load files
   */
  async init(): Promise<void> {
    const config = await this._config.getConfig();

    this._enabled = config.files?.enabled ?? true;
    this._watch = config.files?.watch ?? true;
    this._basePath = config.files?.path ?? "mocks";

    if (!this._enabled) {
      this._logger.info("Files loading is disabled");
      return;
    }

    this._logger.info(
      `Initializing files loader from: ${this._basePath} (watch: ${this._watch})`
    );

    // Load routes and suites
    await this._loadRoutes();
    await this._loadRoutesSuites();
  }

  /**
   * Start watching for file changes
   */
  async start(): Promise<void> {
    if (!this._enabled || !this._watch) {
      return;
    }

    this._logger.info("Starting file watcher...");

    // Watch routes
    const routesPath = join(process.cwd(), this._basePath, "routes");
    this._routesWatcher = watch(routesPath, {
      ignoreInitial: true,
      persistent: true,
    });

    this._routesWatcher.on("all", async (event, path) => {
      this._logger.info(`Route file ${event}: ${path}`);
      this._alerts.set("routes-reload", "Routes are being reloaded");
      await this._loadRoutes();
      this._alerts.remove("routes-reload");
    });

    // Watch routes suites
    const suitesPath = join(process.cwd(), this._basePath, "routesSuites");
    this._suitesWatcher = watch(suitesPath, {
      ignoreInitial: true,
      persistent: true,
    });

    this._suitesWatcher.on("all", async (event, path) => {
      this._logger.info(`Routes suite file ${event}: ${path}`);
      this._alerts.set("suites-reload", "Routes suites are being reloaded");
      await this._loadRoutesSuites();
      this._alerts.remove("suites-reload");
    });

    this._logger.info("File watcher started");
  }

  /**
   * Stop watching for file changes
   */
  async stop(): Promise<void> {
    if (this._routesWatcher) {
      this._logger.info("Stopping routes file watcher...");
      await this._routesWatcher.close();
      this._routesWatcher = undefined;
    }

    if (this._suitesWatcher) {
      this._logger.info("Stopping suites file watcher...");
      await this._suitesWatcher.close();
      this._suitesWatcher = undefined;
    }
  }

  /**
   * Load routes from files
   */
  private async _loadRoutes(): Promise<void> {
    try {
      const routesPath = join(process.cwd(), this._basePath, "routes");

      const { config: routes } = await loadConfig<
        Record<string, RouteDefinition>
      >({
        cwd: routesPath,
        sources: [
          {
            files: "**/*.{js,mjs,cjs,ts,mts,cts,json,yaml,yml}",
          },
        ],
        merge: true,
      });

      if (!routes || Object.keys(routes).length === 0) {
        this._logger.warn(`No routes found in: ${routesPath}`);
        return;
      }

      let loadedCount = 0;
      for (const [fileName, routeData] of Object.entries(routes)) {
        try {
          const routeConfig = this._convertRouteDefinitionToConfig(routeData);
          this._mocksManager.addRoute(routeConfig);
          loadedCount++;
        } catch (err) {
          this._logger.error(
            `Error loading route from ${fileName}: ${err instanceof Error ? err.message : String(err)}`
          );
          this._alerts.set(
            `route-error-${fileName}`,
            `Failed to load route from ${fileName}`
          );
        }
      }

      this._logger.info(`Loaded ${loadedCount} routes`);
    } catch (err) {
      this._logger.error(
        `Error loading routes: ${err instanceof Error ? err.message : String(err)}`
      );
      this._alerts.set("routes-load-error", "Failed to load routes");
    }
  }

  /**
   * Load routes suites from files
   */
  private async _loadRoutesSuites(): Promise<void> {
    try {
      const suitesPath = join(process.cwd(), this._basePath, "routesSuites");

      const { config: suites } = await loadConfig<
        Record<string, RoutesSuiteDefinition>
      >({
        cwd: suitesPath,
        sources: [
          {
            files: "**/*.{js,mjs,cjs,ts,mts,cts,json,yaml,yml}",
          },
        ],
        merge: true,
      });

      if (!suites || Object.keys(suites).length === 0) {
        this._logger.warn(`No routes suites found in: ${suitesPath}`);
        return;
      }

      let loadedCount = 0;
      for (const [fileName, suiteData] of Object.entries(suites)) {
        try {
          const suite = this._convertSuiteDefinitionToConfig(suiteData);
          this._mocksManager.addSuite(suite);
          loadedCount++;
        } catch (err) {
          this._logger.error(
            `Error loading suite from ${fileName}: ${err instanceof Error ? err.message : String(err)}`
          );
          this._alerts.set(
            `suite-error-${fileName}`,
            `Failed to load suite from ${fileName}`
          );
        }
      }

      this._logger.info(`Loaded ${loadedCount} routes suites`);
    } catch (err) {
      this._logger.error(
        `Error loading routes suites: ${err instanceof Error ? err.message : String(err)}`
      );
      this._alerts.set("suites-load-error", "Failed to load routes suites");
    }
  }

  /**
   * Convert route definition to route config
   */
  private _convertRouteDefinitionToConfig(
    definition: RouteDefinition
  ): RouteConfig {
    const url = definition.url || definition.path;
    if (!url) {
      throw new Error(
        `Route ${definition.id} must have either 'url' or 'path' defined`
      );
    }

    const responses = (definition.responses || []).map((r) => ({
      id: r.id,
      status: r.status,
      headers: r.headers,
      body: r.body,
      delay: r.delay,
      handler: r.handler,
    }));

    return {
      id: definition.id,
      url,
      method: definition.method,
      responses,
    };
  }

  /**
   * Convert suite definition to suite config
   */
  private _convertSuiteDefinitionToConfig(
    definition: RoutesSuiteDefinition
  ): RoutesSuite {
    // Convert routes object to array of route IDs
    const routes = Object.keys(definition.routes);

    return {
      id: definition.id,
      routes,
    };
  }
}

export default FilesLoader;
