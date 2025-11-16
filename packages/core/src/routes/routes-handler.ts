import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { VariantsHandler } from "./variants-handler";
import type { HttpMethod } from "./routes-handler.types";

/**
 * RoutesHandler
 *
 * - Registers a lightweight catch-all dispatcher in Fastify for common HTTP
 *   methods and forwards requests to route definitions managed by VariantsHandler.
 * - Routes are matched by exact `path` and `method`.
 * - Supports variants and collections (scenarios) similar to mocks-server.
 *
 * Notes:
 * - Fastify does not provide a built-in way to remove previously registered
 *   routes; registering a small set of catch-all routes and dispatching
 *   manually lets us add/remove mock routes at runtime.
 */
export class RoutesHandler {
  private app: FastifyInstance;
  public variants: VariantsHandler;
  private registered = false;

  constructor(app: FastifyInstance) {
    this.app = app;
    this.variants = new VariantsHandler();
    this.registerCatchAll();
  }

  /**
   * Helper to apply artificial delay.
   */
  private async applyDelay(delay?: number) {
    if (!delay || delay <= 0) return;
    await new Promise((res) => setTimeout(res, delay));
  }

  private registerCatchAll() {
    if (this.registered) return;
    const methods: HttpMethod[] = [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
      "HEAD",
    ];

    for (const method of methods) {
      // register a wildcard route for each method and dispatch manually
      this.app.route({
        method,
        url: "/*",
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
          // request.url may contain query string; parse to get pathname
          const url = new URL(request.url ?? "", "http://localhost");
          const path = url.pathname;

          // Find route using VariantsHandler
          const route = this.variants.findRoute(method, path);
          if (!route) {
            return reply.callNotFound();
          }

          // Resolve the active variant for this route
          const variant = this.variants.resolveVariant(route.id);
          if (!variant) {
            return reply.callNotFound();
          }

          try {
            // Apply optional delay from variant
            await this.applyDelay(variant.delay);

            // If variant has a custom handler, use it
            if (variant.handler) {
              const result = await variant.handler(request, reply);
              // If handler returned a value and did not send, send it now
              if (result !== undefined && !reply.sent) {
                const status = variant.status ?? 200;
                if (variant.headers) {
                  for (const [h, v] of Object.entries(variant.headers)) {
                    reply.header(h, v);
                  }
                }
                return reply.status(status).send(result);
              }
              // Otherwise assume handler sent response
              return;
            }

            // Static response path
            const status = variant.status ?? 200;
            if (variant.headers) {
              for (const [h, v] of Object.entries(variant.headers)) {
                reply.header(h, v);
              }
            }
            return reply.status(status).send(variant.body);
          } catch (err) {
            // bubble error to fastify
            throw err;
          }
        },
      });
    }

    this.registered = true;
  }
}

export default RoutesHandler;
