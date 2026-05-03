import type { Config } from "@dynamic-mock-server/config";

import type { MinimalLogger, MinimalAlerts } from "./files-loader.types.js";

export type {
  HttpMethod,
  RouteResponse,
  RouteConfig,
  RoutesSuite,
} from "./responses-handler.types.js";
import type { RouteConfig, RoutesSuite } from "./responses-handler.types.js";

/**
 * Options for creating a MocksManager instance
 */
export interface MocksManagerOptions {
  /** Optional initial routes to load */
  routes?: RouteConfig[];
  /** Optional initial suites to load */
  suites?: RoutesSuite[];
  /** Optional initial active suite */
  activeSuite?: string | null;
  /** Optional config instance for FilesLoader */
  config?: Config;
  /** Optional logger instance for FilesLoader */
  logger?: MinimalLogger;
  /** Optional alerts instance for FilesLoader */
  alerts?: MinimalAlerts;
}
