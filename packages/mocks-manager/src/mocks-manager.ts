import { NestedRoutesSuites } from "./nested-routes-suites";
import { RoutesHandler } from "./routes-handler";
import type { FastifyInstance } from "fastify";
import type {
  RouteVariant,
  RouteConfig,
  RoutesSuite,
  MocksManagerOptions,
} from "./mocks-manager.types";

/**
 * MocksManager
 *
 * Central manager for all mocks in the Dynamic Mock Server.
 * Manages routes, variants, and routes suites with support for:
 * - Multiple variants per route
 * - Routes suites grouping specific variants
 * - Per-route variant overrides
 * - Nested routes suites for hierarchical organization
 * - Integration with Fastify for handling HTTP requests
 */
export class MocksManager {
  public routesSuites: NestedRoutesSuites;
  public routesHandler: RoutesHandler;

  constructor(options?: MocksManagerOptions) {
    this.routesSuites = new NestedRoutesSuites();
    this.routesHandler = new RoutesHandler();

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
   * Add or update a route configuration with its variants
   */
  addRoute(config: RouteConfig): void {
    this.routesHandler.variants.addRoute(config);
  }

  /**
   * Remove a route by ID
   */
  removeRoute(routeId: string): void {
    this.routesHandler.variants.removeRoute(routeId);
  }

  /**
   * Add a variant to an existing route
   * If the variant already exists, it will be replaced
   */
  addVariant(routeId: string, variant: RouteVariant): void {
    this.routesHandler.variants.addVariant(routeId, variant);
  }

  /**
   * Remove a variant from a route
   */
  removeVariant(routeId: string, variantId: string): void {
    this.routesHandler.variants.removeVariant(routeId, variantId);
  }

  /**
   * Add or update a routes suite
   */
  addSuite(suite: RoutesSuite): void {
    this.routesHandler.variants.addSuite(suite);
  }

  /**
   * Remove a routes suite
   */
  removeSuite(suiteId: string): void {
    this.routesHandler.variants.removeSuite(suiteId);
  }

  /**
   * Set the active routes suite
   * Pass null to clear the active suite
   */
  setActiveSuite(suiteId: string | null): void {
    this.routesHandler.variants.setActiveSuite(suiteId);
  }

  /**
   * Get the current active suite ID
   */
  getActiveSuite(): string | null {
    return this.routesHandler.variants.getActiveSuite();
  }

  /**
   * Override the variant for a specific route
   * This takes precedence over the active suite
   * Pass null to remove the override
   */
  setRouteVariant(routeId: string, variantId: string | null): void {
    this.routesHandler.variants.setRouteVariant(routeId, variantId);
  }

  /**
   * Get all routes
   */
  getRoutes(): RouteConfig[] {
    return this.routesHandler.variants.getRoutes();
  }

  /**
   * Get a specific route by ID
   */
  getRoute(routeId: string): RouteConfig | undefined {
    return this.routesHandler.variants.getRoute(routeId);
  }

  /**
   * Get all routes suites
   */
  getSuites(): RoutesSuite[] {
    return this.routesHandler.variants.getSuites();
  }

  /**
   * Get a specific suite by ID
   */
  getSuite(suiteId: string): RoutesSuite | undefined {
    return this.routesHandler.variants.getSuite(suiteId);
  }

  /**
   * Resolve the active variant for a route based on:
   * 1. Per-route override (if set)
   * 2. Active suite mapping
   * 3. First variant (default)
   */
  resolveVariant(routeId: string): RouteVariant | null {
    return this.routesHandler.variants.resolveVariant(routeId);
  }

  /**
   * Find a route by HTTP method and URL path
   */
  findRoute(method: string, url: string): RouteConfig | null {
    return this.routesHandler.variants.findRoute(method, url);
  }

  /**
   * Clear all routes, suites, and overrides
   */
  clear(): void {
    this.routesHandler.variants.clear();
    this.routesSuites.clear();
  }

  /**
   * Get statistics about the current mocks state
   */
  getStats(): {
    totalRoutes: number;
    totalVariants: number;
    totalSuites: number;
    activeSuite: string | null;
  } {
    const routes = this.routesHandler.variants.getRoutes();
    let totalVariants = 0;
    for (const route of routes) {
      totalVariants += route.variants.length;
    }

    return {
      totalRoutes: routes.length,
      totalVariants,
      totalSuites: this.routesHandler.variants.getSuites().length,
      activeSuite: this.routesHandler.variants.getActiveSuite(),
    };
  }
}

export default MocksManager;
