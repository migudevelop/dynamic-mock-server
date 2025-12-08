import type { Config } from "@dynamic-mock-server/config";
import type { MocksManager } from "./mocks-manager.js";
import type {
  RouteResponse,
  RouteConfig,
  RoutesSuite,
} from "./mocks-manager.types.js";

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
