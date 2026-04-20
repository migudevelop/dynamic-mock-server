import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export type { HttpMethod } from "./responses-handler.types.js";

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
