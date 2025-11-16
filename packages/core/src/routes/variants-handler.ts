import type {
  RouteVariant,
  RouteConfig,
  RoutesSuite,
} from "./variants-handler.types";

/**
 * VariantsHandler
 *
 * Manages route variants and collections (scenarios) similar to mocks-server:
 * - Each route can have multiple named variants with different responses
 * - Collections group specific variants across multiple routes
 * - Can set a global active collection or per-route active variant
 */
export class VariantsHandler {
  private routes = new Map<string, RouteConfig>();
  private suites = new Map<string, RoutesSuite>();
  private activeSuite: string | null = null;
  // per-route overrides (takes precedence over suite)
  private routeVariantOverrides = new Map<string, string>();

  /**
   * Add or update a route configuration with its variants.
   */
  addRoute(config: RouteConfig) {
    // build a quick lookup map for variants
    const variantsMap = new Map<string, RouteVariant>();
    for (const variant of config.variants) {
      variantsMap.set(variant.id, variant);
    }
    config.variantsMap = variantsMap;
    this.routes.set(config.id, config);
  }

  /**
   * Remove a route by id.
   */
  removeRoute(routeId: string) {
    this.routes.delete(routeId);
    this.routeVariantOverrides.delete(routeId);
  }

  /**
   * Add a variant to an existing route.
   */
  addVariant(routeId: string, variant: RouteVariant) {
    const route = this.routes.get(routeId);
    if (!route) {
      throw new Error(`Route "${routeId}" not found`);
    }
    // check if variant already exists and replace, or add new
    const existing = route.variants.findIndex((v) => v.id === variant.id);
    if (existing >= 0) {
      route.variants[existing] = variant;
    } else {
      route.variants.push(variant);
    }
    route.variantsMap!.set(variant.id, variant);
  }

  /**
   * Remove a variant from a route.
   */
  removeVariant(routeId: string, variantId: string) {
    const route = this.routes.get(routeId);
    if (!route) return;
    route.variants = route.variants.filter((v) => v.id !== variantId);
    route.variantsMap!.delete(variantId);
  }

  /**
   * Add or update a suite.
   */
  addSuite(suite: RoutesSuite) {
    this.suites.set(suite.id, suite);
  }

  /**
   * Remove a suite.
   */
  removeSuite(suiteId: string) {
    this.suites.delete(suiteId);
    if (this.activeSuite === suiteId) {
      this.activeSuite = null;
    }
  }

  /**
   * Set the active suite.
   */
  setActiveSuite(suiteId: string | null) {
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
   * Override the variant for a specific route (takes precedence over collection).
   */
  setRouteVariant(routeId: string, variantId: string | null) {
    const route = this.routes.get(routeId);
    if (!route) {
      throw new Error(`Route "${routeId}" not found`);
    }
    if (variantId !== null && !route.variantsMap!.has(variantId)) {
      throw new Error(
        `Variant "${variantId}" not found for route "${routeId}"`
      );
    }
    if (variantId === null) {
      this.routeVariantOverrides.delete(routeId);
    } else {
      this.routeVariantOverrides.set(routeId, variantId);
    }
  }

  /**
   * Get all routes.
   */
  getRoutes(): RouteConfig[] {
    return Array.from(this.routes.values());
  }

  /**
   * Get all suites.
   */
  getSuites(): RoutesSuite[] {
    return Array.from(this.suites.values());
  }

  /**
   * Resolve the active variant for a route based on:
   * 1. Per-route override (if set)
   * 2. Active scenario mapping
   * 3. First variant (default)
   */
  resolveVariant(routeId: string): RouteVariant | null {
    const route = this.routes.get(routeId);
    if (!route || route.variants.length === 0) return null;

    // 1. Check per-route override
    const override = this.routeVariantOverrides.get(routeId);
    if (override) {
      return route.variantsMap!.get(override) ?? null;
    }

    // 2. Check active suite
    if (this.activeSuite) {
      const suite = this.suites.get(this.activeSuite);
      if (suite) {
        // find the route:variant mapping in suite.routes
        const mapping = suite.routes.find((r: string) =>
          r.startsWith(`${routeId}:`)
        );
        if (mapping) {
          const parts = mapping.split(":");
          const variantId = parts[1];
          if (variantId) {
            const variant = route.variantsMap!.get(variantId);
            if (variant) return variant;
          }
        }
      }
    }

    // 3. Default to first variant
    return route.variants[0] ?? null;
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
  clear() {
    this.routes.clear();
    this.suites.clear();
    this.activeSuite = null;
    this.routeVariantOverrides.clear();
  }
}

export default VariantsHandler;
