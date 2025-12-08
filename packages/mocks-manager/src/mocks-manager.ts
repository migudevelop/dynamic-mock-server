import { NestedRoutesSuites } from "./nested-routes-suites.js";
import { RoutesHandler } from "./routes-handler.js";
import { FilesLoader } from "./files-loader.js";
import type { FastifyInstance } from "fastify";
import type {
  RouteResponse,
  RouteConfig,
  RoutesSuite,
  MocksManagerOptions,
} from "./mocks-manager.types.js";

/**
 * MocksManager
 *
 * Central manager for all mocks in the Dynamic Mock Server.
 * Manages routes, responses, and routes suites with support for:
 * - Multiple response options per route
 * - Routes suites grouping specific responses
 * - Per-route response overrides
 * - Nested routes suites for hierarchical organization
 * - Integration with Fastify for handling HTTP requests
 * - File loading with hot-reload support via FilesLoader
 */
export class MocksManager {
  public routesSuites: NestedRoutesSuites;
  public routesHandler: RoutesHandler;
  private _filesLoader?: FilesLoader;

  constructor(options?: MocksManagerOptions) {
    this.routesSuites = new NestedRoutesSuites();
    this.routesHandler = new RoutesHandler();

    // Initialize FilesLoader if dependencies are provided
    if (options?.config && options?.logger && options?.alerts) {
      this._filesLoader = new FilesLoader({
        config: options.config,
        logger: options.logger,
        alerts: options.alerts,
        mocksManager: this,
      });
    }

    if (options?.routes) {
      for (const route of options.routes) {
        this.addRoute(route);
      }
    }

    if (options?.suites) {
      for (const suite of options.suites) {
        this.addSuite(suite);
      }
    }

    if (options?.activeSuite !== undefined) {
      this.setActiveSuite(options.activeSuite);
    }
  }

  /**
   * Set the Fastify instance to handle HTTP requests
   */
  setApp(app: FastifyInstance): void {
    this.routesHandler.setApp(app);
  }

  /**
   * Get the Fastify instance
   */
  getApp(): FastifyInstance | undefined {
    return this.routesHandler.getApp();
  }

  /**
   * Add or update a route configuration with its response options
   */
  addRoute(config: RouteConfig): void {
    this.routesHandler.responses.addRoute(config);
  }

  /**
   * Remove a route by ID
   */
  removeRoute(routeId: string): void {
    this.routesHandler.responses.removeRoute(routeId);
  }

  /**
   * Add a response option to an existing route
   * If the response already exists, it will be replaced
   */
  addResponse(routeId: string, response: RouteResponse): void {
    this.routesHandler.responses.addResponse(routeId, response);
  }

  /**
   * Remove a response option from a route
   */
  removeResponse(routeId: string, responseId: string): void {
    this.routesHandler.responses.removeResponse(routeId, responseId);
  }

  /**
   * Add or update a routes suite
   */
  addSuite(suite: RoutesSuite): void {
    this.routesHandler.responses.addSuite(suite);
  }

  /**
   * Remove a routes suite
   */
  removeSuite(suiteId: string): void {
    this.routesHandler.responses.removeSuite(suiteId);
  }

  /**
   * Set the active routes suite
   * Pass null to clear the active suite
   */
  setActiveSuite(suiteId: string | null): void {
    this.routesHandler.responses.setActiveSuite(suiteId);
  }

  /**
   * Get the current active suite ID
   */
  getActiveSuite(): string | null {
    return this.routesHandler.responses.getActiveSuite();
  }

  /**
   * Override the response for a specific route
   * This takes precedence over the active suite
   * Pass null to remove the override
   */
  setRouteResponse(routeId: string, responseId: string | null): void {
    this.routesHandler.responses.setRouteResponse(routeId, responseId);
  }

  /**
   * Get all routes
   */
  getRoutes(): RouteConfig[] {
    return this.routesHandler.responses.getRoutes();
  }

  /**
   * Get a specific route by ID
   */
  getRoute(routeId: string): RouteConfig | undefined {
    return this.routesHandler.responses.getRoute(routeId);
  }

  /**
   * Get all routes suites
   */
  getSuites(): RoutesSuite[] {
    return this.routesHandler.responses.getSuites();
  }

  /**
   * Get a specific suite by ID
   */
  getSuite(suiteId: string): RoutesSuite | undefined {
    return this.routesHandler.responses.getSuite(suiteId);
  }

  /**
   * Resolve the active response for a route based on:
   * 1. Per-route override (if set)
   * 2. Active suite mapping
   * 3. First response (default)
   */
  resolveResponse(routeId: string): RouteResponse | null {
    return this.routesHandler.responses.resolveResponse(routeId);
  }

  /**
   * Find a route by HTTP method and URL path
   */
  findRoute(method: string, url: string): RouteConfig | null {
    return this.routesHandler.responses.findRoute(method, url);
  }

  /**
   * Clear all routes, suites, and overrides
   */
  clear(): void {
    this.routesHandler.responses.clear();
    this.routesSuites.clear();
  }

  /**
   * Initialize the mocks manager and load files if FilesLoader is available
   */
  async init(): Promise<void> {
    if (this._filesLoader) {
      await this._filesLoader.init();
    }
  }

  /**
   * Start file watching if FilesLoader is available
   */
  async start(): Promise<void> {
    if (this._filesLoader) {
      await this._filesLoader.start();
    }
  }

  /**
   * Stop file watching if FilesLoader is available
   */
  async stop(): Promise<void> {
    if (this._filesLoader) {
      await this._filesLoader.stop();
    }
  }

  /**
   * Get the FilesLoader instance (if available)
   */
  getFilesLoader(): FilesLoader | undefined {
    return this._filesLoader;
  }

  /**
   * Get statistics about the current mocks state
   */
  getStats(): {
    totalRoutes: number;
    totalResponses: number;
    totalSuites: number;
    activeSuite: string | null;
  } {
    const routes = this.routesHandler.responses.getRoutes();
    let totalResponses = 0;
    for (const route of routes) {
      totalResponses += route.responses.length;
    }

    return {
      totalRoutes: routes.length,
      totalResponses,
      totalSuites: this.routesHandler.responses.getSuites().length,
      activeSuite: this.routesHandler.responses.getActiveSuite(),
    };
  }
}

export default MocksManager;
