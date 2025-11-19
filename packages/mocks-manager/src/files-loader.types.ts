import type {
  RouteResponse,
  RouteConfig,
  RoutesSuite,
} from "./mocks-manager.types";

/**
 * Route definition loaded from files (extends RouteConfig with optional url/path)
 */
export interface RouteDefinition
  extends Omit<RouteConfig, "url" | "responses"> {
  /** URL path for this route */
  url?: string;
  /** URL path for this route (alias for url) */
  path?: string;
  /** Array of response options for this route */
  responses?: RouteResponse[];
}

/**
 * Routes suite definition as loaded from files (uses Record for easier file authoring)
 * Will be converted to RoutesSuite format internally
 */
export interface RoutesSuiteDefinition {
  /** Unique identifier for the suite */
  id: string;
  /** Map of route IDs to their selected response IDs */
  routes: Record<string, string>;
}

/**
 * Re-export RouteResponse from mocks-manager for convenience
 */
export type { RouteResponse as RouteResponseDefinition, RoutesSuite };
