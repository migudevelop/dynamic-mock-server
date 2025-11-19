import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

/**
 * HTTP methods supported by the routes handler
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
 * Options for creating a RoutesHandler instance
 */
export interface RoutesHandlerOptions {
  /** Optional Fastify instance to register routes on */
  app?: FastifyInstance;
}

/**
 * Request type from Fastify
 */
export type RouteRequest = FastifyRequest;

/**
 * Reply type from Fastify
 */
export type RouteReply = FastifyReply;
