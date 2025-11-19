import type {
  RouteVariant,
  RouteConfig,
  RoutesSuite,
} from "@dynamic-mock-server/mocks-manager";

/**
 * Route definition loaded from files (extends RouteConfig with optional url/path)
 */
export interface RouteDefinition extends Omit<RouteConfig, "url" | "variants"> {
  /** URL path for this route */
  url?: string;
  /** URL path for this route (alias for url) */
  path?: string;
  /** Array of variants for this route */
  variants?: RouteVariant[];
}

/**
 * Routes suite definition as loaded from files (uses Record for easier file authoring)
 * Will be converted to RoutesSuite format internally
 */
export interface RoutesSuiteDefinition {
  /** Unique identifier for the suite */
  id: string;
  /** Map of route IDs to their selected variant IDs */
  routes: Record<string, string>;
}

/**
 * Re-export RouteVariant from mocks-manager for convenience
 */
export type { RouteVariant as RouteVariantDefinition, RoutesSuite };
