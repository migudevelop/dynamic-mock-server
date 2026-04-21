import { tauriCommands } from "@/helpers/tauri-commands";
import type { AdminStatusResponse } from "@/types/server.types";
import type { RouteDto, UpsertRoutePayload } from "@/types/route.types";
import type {
  SuitesListResponse,
  UpsertSuitePayload,
} from "@/types/suite.types";

/**
 * Provides typed functions to interact with the mock server's admin REST API.
 * All HTTP calls are proxied through Tauri commands to avoid CORS.
 *
 * @returns Object with admin API action functions
 */
export function useAdminApi() {
  /**
   * Sends a request to the admin API and parses the JSON response.
   *
   * @param method - HTTP method
   * @param path - Path relative to /__admin
   * @param body - Optional request body (will be JSON.stringified)
   * @returns Parsed response data
   */
  async function request<T>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    path: string,
    body?: unknown,
  ): Promise<T> {
    const resp = await tauriCommands.adminRequest({
      method,
      path,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (resp.statusCode >= 400) {
      throw new Error(`Admin API error ${resp.statusCode}: ${resp.body}`);
    }
    if (!resp.body || resp.body.trim() === "") {
      return undefined as T;
    }
    return JSON.parse(resp.body) as T;
  }

  return {
    /**
     * Fetches the current server status from the admin API.
     *
     * @returns Admin status response with stats
     */
    getStatus: () => request<AdminStatusResponse>("GET", "/status"),

    /**
     * Returns all registered mock routes.
     *
     * @returns Array of route DTOs
     */
    getRoutes: () => request<RouteDto[]>("GET", "/routes"),

    /**
     * Adds or updates a mock route at runtime.
     * The server hot-reloads the route without restart.
     *
     * @param route - Route to add or update
     */
    upsertRoute: (route: UpsertRoutePayload) =>
      request<void>("POST", "/routes", route),

    /**
     * Removes a mock route by ID.
     *
     * @param routeId - ID of the route to remove
     */
    removeRoute: (routeId: string) =>
      request<void>("DELETE", `/routes/${encodeURIComponent(routeId)}`),

    /**
     * Sets the active response for a specific route at runtime.
     *
     * @param routeId - ID of the route
     * @param responseId - ID of the response to activate, or null to clear
     */
    setActiveResponse: (routeId: string, responseId: string | null) =>
      request<void>("PUT", `/routes/${encodeURIComponent(routeId)}/response`, {
        responseId,
      }),

    /**
     * Returns all suites and the currently active suite name.
     *
     * @returns Suites list with active suite info
     */
    getSuites: () => request<SuitesListResponse>("GET", "/suites"),

    /**
     * Adds or updates a suite at runtime.
     *
     * @param suite - Suite to add or update
     */
    upsertSuite: (suite: UpsertSuitePayload) =>
      request<void>("POST", "/suites", suite),

    /**
     * Removes a suite by ID.
     *
     * @param suiteId - ID of the suite to remove
     */
    removeSuite: (suiteId: string) =>
      request<void>("DELETE", `/suites/${encodeURIComponent(suiteId)}`),

    /**
     * Sets the active suite (switches which responses are active).
     *
     * @param suiteId - ID of the suite to activate, or null to clear
     */
    setActiveSuite: (suiteId: string | null) =>
      request<void>("PUT", "/suite", { suiteId }),

    /**
     * Clears all routes and suites from the server.
     */
    clearAll: () => request<void>("DELETE", "/clear"),
  };
}
