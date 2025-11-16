import { FastifyInstance } from "fastify";
import { RoutesHandler } from "./routes-handler";
import type {
  RouteConfig,
  RouteVariant,
  RoutesSuite,
} from "./variants-handler.types";

/**
 * AdminRoutes
 *
 * Provides HTTP endpoints to manage mock routes, variants, and suites at runtime.
 * All endpoints are prefixed with /__admin
 *
 * Similar to mocks-server's admin API.
 */
export class AdminRoutes {
  private app: FastifyInstance;
  private routesHandler: RoutesHandler;
  private prefix: string;

  constructor(
    app: FastifyInstance,
    routesHandler: RoutesHandler,
    options?: { prefix?: string }
  ) {
    this.app = app;
    this.routesHandler = routesHandler;
    this.prefix = options?.prefix ?? "/__admin";
    this.registerRoutes();
  }

  private registerRoutes() {
    // Get all routes
    this.app.get(`${this.prefix}/routes`, async (request, reply) => {
      const routes = this.routesHandler.variants.getRoutes();
      return reply.send({ routes });
    });

    // Add or update a route
    this.app.post<{ Body: RouteConfig }>(
      `${this.prefix}/routes`,
      async (request, reply) => {
        try {
          const config = request.body;
          if (!config.id || !config.url || !config.method) {
            return reply.status(400).send({
              error: "Missing required fields: id, url, method",
            });
          }
          this.routesHandler.variants.addRoute(config);
          return reply.status(201).send({ success: true, route: config });
        } catch (err) {
          return reply.status(400).send({
            error: err instanceof Error ? err.message : "Unknown error",
          });
        }
      }
    );

    // Remove a route
    this.app.delete<{ Params: { routeId: string } }>(
      `${this.prefix}/routes/:routeId`,
      async (request, reply) => {
        const { routeId } = request.params;
        this.routesHandler.variants.removeRoute(routeId);
        return reply.send({ success: true });
      }
    );

    // Add a variant to a route
    this.app.post<{ Params: { routeId: string }; Body: RouteVariant }>(
      `${this.prefix}/routes/:routeId/variants`,
      async (request, reply) => {
        try {
          const { routeId } = request.params;
          const variant = request.body;
          if (!variant.id) {
            return reply.status(400).send({
              error: "Missing required field: variant.id",
            });
          }
          this.routesHandler.variants.addVariant(routeId, variant);
          return reply.status(201).send({ success: true, variant });
        } catch (err) {
          return reply.status(400).send({
            error: err instanceof Error ? err.message : "Unknown error",
          });
        }
      }
    );

    // Remove a variant from a route
    this.app.delete<{ Params: { routeId: string; variantId: string } }>(
      `${this.prefix}/routes/:routeId/variants/:variantId`,
      async (request, reply) => {
        const { routeId, variantId } = request.params;
        this.routesHandler.variants.removeVariant(routeId, variantId);
        return reply.send({ success: true });
      }
    );

    // Set active variant for a route
    this.app.put<{
      Params: { routeId: string };
      Body: { variantId: string | null };
    }>(`${this.prefix}/routes/:routeId/variant`, async (request, reply) => {
      try {
        const { routeId } = request.params;
        const { variantId } = request.body;
        this.routesHandler.variants.setRouteVariant(routeId, variantId);
        return reply.send({ success: true, routeId, variantId });
      } catch (err) {
        return reply.status(400).send({
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    });

    // Get all suites
    this.app.get(`${this.prefix}/suites`, async (request, reply) => {
      const suites = this.routesHandler.variants.getSuites();
      const activeSuite = this.routesHandler.variants.getActiveSuite();
      return reply.send({ suites, activeSuite });
    });

    // Add or update a suite
    this.app.post<{ Body: RoutesSuite }>(
      `${this.prefix}/suites`,
      async (request, reply) => {
        try {
          const suite = request.body;
          if (!suite.id || !suite.routes) {
            return reply.status(400).send({
              error: "Missing required fields: id, routes",
            });
          }
          this.routesHandler.variants.addSuite(suite);
          return reply.status(201).send({ success: true, suite });
        } catch (err) {
          return reply.status(400).send({
            error: err instanceof Error ? err.message : "Unknown error",
          });
        }
      }
    );

    // Remove a suite
    this.app.delete<{ Params: { suiteId: string } }>(
      `${this.prefix}/suites/:suiteId`,
      async (request, reply) => {
        const { suiteId } = request.params;
        this.routesHandler.variants.removeSuite(suiteId);
        return reply.send({ success: true });
      }
    );

    // Set active suite
    this.app.put<{ Body: { suiteId: string | null } }>(
      `${this.prefix}/suite`,
      async (request, reply) => {
        try {
          const { suiteId } = request.body;
          this.routesHandler.variants.setActiveSuite(suiteId);
          return reply.send({ success: true, suiteId });
        } catch (err) {
          return reply.status(400).send({
            error: err instanceof Error ? err.message : "Unknown error",
          });
        }
      }
    );

    // Clear all routes and suites
    this.app.delete(`${this.prefix}/clear`, async (request, reply) => {
      this.routesHandler.variants.clear();
      return reply.send({ success: true });
    });

    // Health/status endpoint
    this.app.get(`${this.prefix}/status`, async (request, reply) => {
      const routesCount = this.routesHandler.variants.getRoutes().length;
      const suitesCount = this.routesHandler.variants.getSuites().length;
      const activeSuite = this.routesHandler.variants.getActiveSuite();
      return reply.send({
        status: "ok",
        routes: routesCount,
        suites: suitesCount,
        activeSuite,
      });
    });
  }
}

export default AdminRoutes;
