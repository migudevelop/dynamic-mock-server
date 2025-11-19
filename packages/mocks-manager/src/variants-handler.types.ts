import type { FastifyReply, FastifyRequest } from "fastify";

/**
 * Represents a variant of a route with specific response configuration
 */
export interface RouteVariant {
  /** Unique identifier for the variant */
  id: string;
  /** HTTP status code for the response */
  status?: number;
  /** Custom headers for the response */
  headers?: Record<string, string>;
  /** Response body (can be any JSON-serializable data) */
  body?: unknown;
  /** Custom handler function for dynamic responses */
  handler?: (
    request: FastifyRequest,
    reply: FastifyReply
  ) => Promise<unknown> | unknown;
  /** Artificial delay in milliseconds before sending the response */
  delay?: number;
}

/**
 * Configuration for a route with all its variants
 */
export interface RouteConfig {
  /** Unique identifier for the route */
  id: string;
  /** URL path for the route (e.g., /api/users) */
  url: string;
  /** HTTP method for the route */
  method: string;
  /** Array of variants for this route */
  variants: RouteVariant[];
  /** Internal map for quick variant lookup */
  variantsMap?: Map<string, RouteVariant>;
}

/**
 * A suite that groups specific variants across multiple routes
 */
export interface RoutesSuite {
  /** Unique identifier for the suite */
  id: string;
  /** Array of "routeId:variantId" combinations */
  routes: string[];
}
