import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { HttpMethod, RoutesHandlerOptions } from "./routes-handler.types";
import { ResponsesHandler } from "./responses-handler";

/**
 * RoutesHandler
 *
 * - Registers a lightweight catch-all dispatcher in Fastify for common HTTP
 *   methods and forwards requests to route definitions managed by ResponsesHandler.
 * - Routes are matched by exact `path` and `method`.
 *
 * Notes:
 * - Fastify does not provide a built-in way to remove previously registered
 *   routes; registering a small set of catch-all routes and dispatching
 *   manually lets us add/remove mock routes at runtime.
 */
export class RoutesHandler {
  private _app?: FastifyInstance;
  public responses: ResponsesHandler;
  private registered = false;

  constructor(options?: RoutesHandlerOptions) {
    this.responses = new ResponsesHandler();
    if (options?.app) {
      this.setApp(options.app);
    }
  }

  /**
   * Set the Fastify instance and register routes
   */
  setApp(app: FastifyInstance): void {
    this._app = app;
    this.registerCatchAll();
  }

  /**
   * Get the Fastify instance
   */
  getApp(): FastifyInstance | undefined {
    return this._app;
  }

  /**
   * Helper to apply artificial delay.
   */
  private async applyDelay(delay?: number) {
    if (!delay || delay <= 0) return;
    await new Promise((res) => setTimeout(res, delay));
  }

  /**
   * Register catch-all routes for all HTTP methods
   */
  private registerCatchAll() {
    if (this.registered || !this._app) return;
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
      this._app.route({
        method,
        url: "/*",
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
          // request.url may contain query string; parse to get pathname
          const url = new URL(request.url ?? "", "http://localhost");
          const path = url.pathname;

          // Find route using ResponsesHandler
          const route = this.responses.findRoute(method, path);
          if (!route) {
            return reply.callNotFound();
          }

          // Resolve the active response for this route
          const response = this.responses.resolveResponse(route.id);
          if (!response) {
            return reply.callNotFound();
          }

          // Apply optional delay from response
          await this.applyDelay(response.delay);

          // If response has a custom handler, use it
          if (response.handler) {
            const result = await response.handler(request, reply);
            // If handler returned a value and did not send, send it now
            if (result !== undefined && !reply.sent) {
              const status = response.status ?? 200;
              if (response.headers) {
                for (const [h, v] of Object.entries(response.headers)) {
                  reply.header(h, v);
                }
              }
              return reply.status(status).send(result);
            }
            // Otherwise assume handler sent response
            return;
          }

          // Static response path
          const status = response.status ?? 200;
          if (response.headers) {
            for (const [h, v] of Object.entries(response.headers)) {
              reply.header(h, v);
            }
          }
          return reply.status(status).send(response.body);
        },
      });
    }

    this.registered = true;
  }

  /**
   * Check if routes are registered
   */
  isRegistered(): boolean {
    return this.registered;
  }
}

export default RoutesHandler;
