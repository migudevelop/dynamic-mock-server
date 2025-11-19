import type {
  RouteResponse,
  RouteConfig,
  RoutesSuite,
} from "./responses-handler.types";

/**
 * ResponsesHandler
 *
 * Manages route responses and routes suites:
 * - Each route can have multiple named responses with different configurations
 * - Routes suites group specific responses across multiple routes
 * - Can set a global active suite or per-route active response
 */
export class ResponsesHandler {
  private routes = new Map<string, RouteConfig>();
  private suites = new Map<string, RoutesSuite>();
  private activeSuite: string | null = null;
  // per-route overrides (takes precedence over suite)
  private routeResponseOverrides = new Map<string, string>();

  /**
   * Add or update a route configuration with its responses.
   */
  addRoute(config: RouteConfig): void {
    // build a quick lookup map for responses
    const responsesMap = new Map<string, RouteResponse>();
    for (const response of config.responses) {
      responsesMap.set(response.id, response);
    }
    config.responsesMap = responsesMap;
    this.routes.set(config.id, config);
  }

  /**
   * Remove a route by id.
   */
  removeRoute(routeId: string): void {
    this.routes.delete(routeId);
    this.routeResponseOverrides.delete(routeId);
  }

  /**
   * Add a response to an existing route.
   */
  addResponse(routeId: string, response: RouteResponse): void {
    const route = this.routes.get(routeId);
    if (!route) {
      throw new Error(`Route "${routeId}" not found`);
    }
    // check if response already exists and replace, or add new
    const existing = route.responses.findIndex((r) => r.id === response.id);
    if (existing >= 0) {
      route.responses[existing] = response;
    } else {
      route.responses.push(response);
    }
    route.responsesMap!.set(response.id, response);
  }

  /**
   * Remove a response from a route.
   */
  removeResponse(routeId: string, responseId: string): void {
    const route = this.routes.get(routeId);
    if (!route) return;
    route.responses = route.responses.filter((r) => r.id !== responseId);
    route.responsesMap!.delete(responseId);
  }

  /**
   * Add or update a suite.
   */
  addSuite(suite: RoutesSuite): void {
    this.suites.set(suite.id, suite);
  }

  /**
   * Remove a suite.
   */
  removeSuite(suiteId: string): void {
    this.suites.delete(suiteId);
    if (this.activeSuite === suiteId) {
      this.activeSuite = null;
    }
  }

  /**
   * Set the active suite.
   */
  setActiveSuite(suiteId: string | null): void {
    if (suiteId !== null && !this.suites.has(suiteId)) {
      throw new Error(`Suite "${suiteId}" not found`);
    }
    this.activeSuite = suiteId;
  }

  /**
   * Get the current active suite id.
   */
  getActiveSuite(): string | null {
    return this.activeSuite;
  }

  /**
   * Override the response for a specific route (takes precedence over suite).
   */
  setRouteResponse(routeId: string, responseId: string | null): void {
    const route = this.routes.get(routeId);
    if (!route) {
      throw new Error(`Route "${routeId}" not found`);
    }
    if (responseId !== null && !route.responsesMap!.has(responseId)) {
      throw new Error(
        `Response "${responseId}" not found for route "${routeId}"`
      );
    }
    if (responseId === null) {
      this.routeResponseOverrides.delete(routeId);
    } else {
      this.routeResponseOverrides.set(routeId, responseId);
    }
  }

  /**
   * Get all routes.
   */
  getRoutes(): RouteConfig[] {
    return Array.from(this.routes.values());
  }

  /**
   * Get a specific route by ID.
   */
  getRoute(routeId: string): RouteConfig | undefined {
    return this.routes.get(routeId);
  }

  /**
   * Get all suites.
   */
  getSuites(): RoutesSuite[] {
    return Array.from(this.suites.values());
  }

  /**
   * Get a specific suite by ID.
   */
  getSuite(suiteId: string): RoutesSuite | undefined {
    return this.suites.get(suiteId);
  }

  /**
   * Resolve the active response for a route based on:
   * 1. Per-route override (if set)
   * 2. Active suite mapping
   * 3. First response (default)
   */
  resolveResponse(routeId: string): RouteResponse | null {
    const route = this.routes.get(routeId);
    if (!route || route.responses.length === 0) return null;

    // 1. Check per-route override
    const override = this.routeResponseOverrides.get(routeId);
    if (override) {
      return route.responsesMap!.get(override) ?? null;
    }

    // 2. Check active suite
    if (this.activeSuite) {
      const suite = this.suites.get(this.activeSuite);
      if (suite) {
        // find the route:response mapping in suite.routes
        const mapping = suite.routes.find((r: string) =>
          r.startsWith(`${routeId}:`)
        );
        if (mapping) {
          const parts = mapping.split(":");
          const responseId = parts[1];
          if (responseId) {
            const response = route.responsesMap!.get(responseId);
            if (response) return response;
          }
        }
      }
    }

    // 3. Default to first response
    return route.responses[0] ?? null;
  }

  /**
   * Find a route by method and url.
   */
  findRoute(method: string, url: string): RouteConfig | null {
    for (const route of this.routes.values()) {
      if (
        route.method.toUpperCase() === method.toUpperCase() &&
        route.url === url
      ) {
        return route;
      }
    }
    return null;
  }

  /**
   * Clear all routes and suites.
   */
  clear(): void {
    this.routes.clear();
    this.suites.clear();
    this.activeSuite = null;
    this.routeResponseOverrides.clear();
  }
}

export default ResponsesHandler;
