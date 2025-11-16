import type { FastifyReply, FastifyRequest } from "fastify";

export interface RouteVariant {
  id: string; // unique id for the variant
  status?: number;
  headers?: Record<string, string>;
  body?: unknown;
  handler?: (
    request: FastifyRequest,
    reply: FastifyReply
  ) => Promise<unknown> | unknown;
  delay?: number; // artificial delay in ms before sending response
}

export interface RouteConfig {
  id: string; // unique route id (e.g., "get-users")
  url: string; // path for the route (e.g., /api/users)
  method: string; // HTTP method (GET, POST, etc.)
  variants: RouteVariant[];
  variantsMap?: Map<string, RouteVariant>;
}

export interface RoutesSuite {
  id: string;
  routes: string[]; // array of "routeId:variantId" combinations
}
