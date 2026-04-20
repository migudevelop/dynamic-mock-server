import { readFile } from "fs/promises";
import { join } from "path";
import { pathToFileURL } from "url";

import type { Config } from "@dynamic-mock-server/config";
import { watch, type FSWatcher } from "chokidar";
import fg from "fast-glob";
import { isArray } from "types-guards";

import type {
  RouteDefinition,
  RoutesSuiteDefinition,
} from "./files-loader.types.js";
import type {
  MinimalLogger,
  MinimalAlerts,
  FilesLoaderOptions,
} from "./files-loader.types.js";
import type { MocksManager } from "./mocks-manager.js";
import type { RouteConfig, RoutesSuite } from "./mocks-manager.types.js";

/**
 * FilesLoader manages loading of mock files (routes and suites) with hot-reload support.
 * Uses fast-glob for file discovery, dynamic imports for loading, and chokidar for watching.
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
    const config = this._config.getConfig();

    this._enabled = config.files?.enabled ?? true;
    this._watch = config.files?.watch ?? true;
    this._basePath = config.files?.path ?? "mocks";

    if (!this._enabled) {
      this._logger.info("Files loading is disabled");
      return;
    }

    this._logger.info(
      `Initializing files loader from: ${this._basePath} (watch: ${this._watch})`,
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
   * Load routes from files using fast-glob and dynamic imports with cache busting
   */
  private async _loadRoutes(): Promise<void> {
    try {
      const routesPath = join(process.cwd(), this._basePath, "routes");

      this._logger.info(`Looking for route files in: ${routesPath}`);

      // Get all route files using fast-glob
      const files = await fg("**/*.{js,mjs,cjs,ts,mts,cts,json}", {
        cwd: routesPath,
        onlyFiles: true,
        absolute: false,
      });

      if (files.length === 0) {
        this._logger.warn(`No route files found in: ${routesPath}`);
        return;
      }

      this._logger.info(`Found ${files.length} route file(s)`);

      let loadedCount = 0;

      // Load each file individually using dynamic import
      for (const file of files) {
        try {
          const filePath = join(routesPath, file);
          const isJson = file.endsWith(".json");

          let routesData: RouteDefinition | RouteDefinition[];

          if (isJson) {
            // For JSON files, read and parse
            const content = await readFile(filePath, "utf-8");
            routesData = JSON.parse(content);
          } else {
            // For JS/TS files, use dynamic import with cache busting
            const fileUrl = pathToFileURL(filePath).href;
            const module = await import(`${fileUrl}?t=${Date.now()}`);
            routesData = module.default || module;
          }

          if (!routesData) {
            this._logger.warn(`Could not load routes from file: ${file}`);
            continue;
          }

          // Ensure routesData is an array
          const routesArray = Array.isArray(routesData)
            ? routesData
            : [routesData];

          // Process each route in the array
          for (const routeData of routesArray) {
            try {
              const routeConfig =
                this._convertRouteDefinitionToConfig(routeData);
              this._mocksManager.addRoute(routeConfig);
              loadedCount++;
              this._logger.info(
                `✓ Loaded route: ${routeConfig.id} from ${file}`,
              );
            } catch (err) {
              this._logger.error(
                `Error converting route from ${file}: ${err instanceof Error ? err.message : String(err)}`,
              );
            }
          }
        } catch (err) {
          this._logger.error(
            `Error loading route from ${file}: ${err instanceof Error ? err.message : String(err)}`,
          );
          this._alerts.set(
            `route-error-${file}`,
            `Failed to load route from ${file}`,
          );
        }
      }

      this._logger.info(
        `Successfully loaded ${loadedCount} of ${files.length} routes`,
      );
    } catch (err) {
      this._logger.error(
        `Error loading routes: ${err instanceof Error ? err.message : String(err)}`,
      );
      this._alerts.set("routes-load-error", "Failed to load routes");
    }
  }

  /**
   * Load routes suites from files using fast-glob and dynamic imports with cache busting
   */
  private async _loadRoutesSuites(): Promise<void> {
    try {
      const suitesPath = join(process.cwd(), this._basePath, "routesSuites");

      this._logger.info(`Looking for suite files in: ${suitesPath}`);

      // Get all suite files using fast-glob
      const files = await fg("**/*.{js,mjs,cjs,ts,mts,cts,json}", {
        cwd: suitesPath,
        onlyFiles: true,
        absolute: false,
      });

      if (files.length === 0) {
        this._logger.warn(`No suite files found in: ${suitesPath}`);
        return;
      }

      this._logger.info(`Found ${files.length} suite file(s)`);

      let loadedCount = 0;

      // Load each file individually using dynamic import
      for (const file of files) {
        try {
          const filePath = join(suitesPath, file);
          const isJson = file.endsWith(".json");

          let suiteData: RoutesSuiteDefinition;

          if (isJson) {
            // For JSON files, read and parse
            const content = await readFile(filePath, "utf-8");
            suiteData = JSON.parse(content);
          } else {
            // For JS/TS files, use dynamic import with cache busting
            const fileUrl = pathToFileURL(filePath).href;
            const module = await import(`${fileUrl}?t=${Date.now()}`);
            suiteData = module.default || module;
          }

          if (!suiteData) {
            this._logger.warn(`Could not load suite from file: ${file}`);
            continue;
          }
          const suitesData = isArray(suiteData) ? suiteData : [suiteData];

          for (const singleSuiteData of suitesData) {
            const suite = this._convertSuiteDefinitionToConfig(singleSuiteData);
            this._mocksManager.addSuite(suite);
            loadedCount++;
            this._logger.info(`Loaded suite: ${suite.id} from ${file}`);
          }
        } catch (err) {
          this._logger.error(
            `Error loading suite from ${file}: ${err instanceof Error ? err.message : String(err)}`,
          );
          this._alerts.set(
            `suite-error-${file}`,
            `Failed to load suite from ${file}`,
          );
        }
      }

      this._logger.info(
        `Successfully loaded ${loadedCount} of ${files.length} suites`,
      );
    } catch (err) {
      this._logger.error(
        `Error loading routes suites: ${err instanceof Error ? err.message : String(err)}`,
      );
      this._alerts.set("suites-load-error", "Failed to load routes suites");
    }
  }

  /**
   * Convert route definition to route config
   */
  private _convertRouteDefinitionToConfig(
    definition: RouteDefinition,
  ): RouteConfig {
    const url = definition.url || definition.path;
    if (!url) {
      throw new Error(
        `Route ${definition.id} must have either 'url' or 'path' defined`,
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
    definition: RoutesSuiteDefinition,
  ): RoutesSuite {
    // Convert routes record to "routeId:responseId" array entries
    const routes = Object.entries(definition.routes).map(
      ([routeId, responseId]) => `${routeId}:${responseId}`,
    );

    return {
      id: definition.id,
      routes,
    };
  }
}

export default FilesLoader;
