import type { FastifyReply, FastifyRequest } from "fastify";

/**
 * HTTP methods supported by the mocks manager
 */
export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "OPTIONS"
  | "HEAD";

/**
 * Represents a response option for a route
 */
export interface RouteResponse {
  /** Unique identifier for the response */
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
    reply: FastifyReply,
  ) => Promise<unknown> | unknown;
  /** Artificial delay in milliseconds before sending the response */
  delay?: number;
}

/**
 * Configuration for a route with all its responses
 */
export interface RouteConfig {
  /** Unique identifier for the route */
  id: string;
  /** URL path for the route (e.g., /api/users) */
  url: string;
  /** HTTP method for the route */
  method: string;
  /** Array of response options for this route */
  responses: RouteResponse[];
  /** Internal map for quick response lookup */
  responsesMap?: Map<string, RouteResponse>;
}

/**
 * A suite that groups specific responses across multiple routes
 */
export interface RoutesSuite {
  /** Unique identifier for the suite */
  id: string;
  /** Array of "routeId:responseId" combinations */
  routes: string[];
}
