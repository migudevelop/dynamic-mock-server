import { describe, it, expect, beforeEach } from "vitest";

import { ResponsesHandler } from "./responses-handler.js";
import type { RouteConfig, RoutesSuite } from "./responses-handler.types.js";

/**
 * Helper to create a test route with sensible defaults.
 */
function createRoute(overrides?: Partial<RouteConfig>): RouteConfig {
  return {
    id: "test-route",
    url: "/api/test",
    method: "GET",
    responses: [
      { id: "success", status: 200, body: { ok: true } },
      { id: "error", status: 500, body: { error: "fail" } },
    ],
    ...overrides,
  };
}

describe("ResponsesHandler", () => {
  let handler: ResponsesHandler;

  beforeEach(() => {
    handler = new ResponsesHandler();
  });

  describe("addRoute / getRoute / getRoutes", () => {
    it("should add and retrieve a route", () => {
      const route = createRoute();
      handler.addRoute(route);
      expect(handler.getRoute("test-route")).toBeDefined();
      expect(handler.getRoute("test-route")!.url).toBe("/api/test");
    });

    it("should return undefined for non-existent route", () => {
      expect(handler.getRoute("nope")).toBeUndefined();
    });

    it("should list all routes", () => {
      handler.addRoute(createRoute({ id: "r1" }));
      handler.addRoute(createRoute({ id: "r2" }));
      expect(handler.getRoutes()).toHaveLength(2);
    });

    it("should overwrite route with same id", () => {
      handler.addRoute(createRoute({ url: "/old" }));
      handler.addRoute(createRoute({ url: "/new" }));
      expect(handler.getRoute("test-route")!.url).toBe("/new");
    });
  });

  describe("removeRoute", () => {
    it("should remove an existing route", () => {
      handler.addRoute(createRoute());
      handler.removeRoute("test-route");
      expect(handler.getRoute("test-route")).toBeUndefined();
    });

    it("should also clear route response override", () => {
      handler.addRoute(createRoute());
      handler.setRouteResponse("test-route", "success");
      handler.removeRoute("test-route");
      // re-add and verify override is gone
      handler.addRoute(createRoute());
      const resolved = handler.resolveResponse("test-route");
      // should default to first response (no override)
      expect(resolved!.id).toBe("success");
    });
  });

  describe("addResponse / removeResponse", () => {
    it("should add a response to an existing route", () => {
      handler.addRoute(createRoute());
      handler.addResponse("test-route", {
        id: "new",
        status: 201,
        body: "created",
      });
      const route = handler.getRoute("test-route")!;
      expect(route.responses).toHaveLength(3);
    });

    it("should replace an existing response with same id", () => {
      handler.addRoute(createRoute());
      handler.addResponse("test-route", {
        id: "success",
        status: 200,
        body: "updated",
      });
      const route = handler.getRoute("test-route")!;
      expect(route.responses).toHaveLength(2); // not 3
      expect(route.responses.find((r) => r.id === "success")!.body).toBe(
        "updated",
      );
    });

    it("should throw when adding response to non-existent route", () => {
      expect(() =>
        handler.addResponse("nope", { id: "x", status: 200 }),
      ).toThrow();
    });

    it("should remove a response from a route", () => {
      handler.addRoute(createRoute());
      handler.removeResponse("test-route", "success");
      const route = handler.getRoute("test-route")!;
      expect(route.responses).toHaveLength(1);
      expect(route.responses[0]!.id).toBe("error");
    });
  });

  describe("suites", () => {
    it("should add and retrieve suites", () => {
      const suite: RoutesSuite = {
        id: "base",
        routes: ["test-route:success"],
      };
      handler.addSuite(suite);
      expect(handler.getSuite("base")).toBeDefined();
      expect(handler.getSuites()).toHaveLength(1);
    });

    it("should remove a suite", () => {
      handler.addSuite({ id: "base", routes: [] });
      handler.removeSuite("base");
      expect(handler.getSuite("base")).toBeUndefined();
    });

    it("should clear activeSuite when removing the active suite", () => {
      handler.addSuite({ id: "base", routes: [] });
      handler.setActiveSuite("base");
      handler.removeSuite("base");
      expect(handler.getActiveSuite()).toBeNull();
    });

    it("should throw when setting non-existent suite as active", () => {
      expect(() => handler.setActiveSuite("nonexistent")).toThrow();
    });

    it("should allow setting null as active suite", () => {
      handler.addSuite({ id: "base", routes: [] });
      handler.setActiveSuite("base");
      handler.setActiveSuite(null);
      expect(handler.getActiveSuite()).toBeNull();
    });
  });

  describe("resolveResponse", () => {
    it("should return first response by default", () => {
      handler.addRoute(createRoute());
      const response = handler.resolveResponse("test-route");
      expect(response!.id).toBe("success");
    });

    it("should return null for non-existent route", () => {
      expect(handler.resolveResponse("nope")).toBeNull();
    });

    it("should return null for route with no responses", () => {
      handler.addRoute(createRoute({ responses: [] }));
      expect(handler.resolveResponse("test-route")).toBeNull();
    });

    it("should resolve from active suite", () => {
      handler.addRoute(createRoute());
      handler.addSuite({ id: "errors", routes: ["test-route:error"] });
      handler.setActiveSuite("errors");
      const response = handler.resolveResponse("test-route");
      expect(response!.id).toBe("error");
    });

    it("should prefer per-route override over suite", () => {
      handler.addRoute(createRoute());
      handler.addSuite({ id: "errors", routes: ["test-route:error"] });
      handler.setActiveSuite("errors");
      handler.setRouteResponse("test-route", "success");
      const response = handler.resolveResponse("test-route");
      expect(response!.id).toBe("success");
    });

    it("should fall back to default when suite has no mapping for route", () => {
      handler.addRoute(createRoute());
      handler.addSuite({ id: "empty", routes: [] });
      handler.setActiveSuite("empty");
      const response = handler.resolveResponse("test-route");
      expect(response!.id).toBe("success");
    });
  });

  describe("setRouteResponse (override)", () => {
    it("should throw for non-existent route", () => {
      expect(() => handler.setRouteResponse("nope", "success")).toThrow();
    });

    it("should throw for non-existent response", () => {
      handler.addRoute(createRoute());
      expect(() =>
        handler.setRouteResponse("test-route", "nonexistent"),
      ).toThrow();
    });

    it("should clear override when null", () => {
      handler.addRoute(createRoute());
      handler.setRouteResponse("test-route", "error");
      handler.setRouteResponse("test-route", null);
      const response = handler.resolveResponse("test-route");
      expect(response!.id).toBe("success"); // back to default
    });
  });

  describe("findRoute", () => {
    it("should find route by exact match", () => {
      handler.addRoute(createRoute());
      const found = handler.findRoute("GET", "/api/test");
      expect(found).not.toBeNull();
      expect(found!.id).toBe("test-route");
    });

    it("should be case-insensitive for method", () => {
      handler.addRoute(createRoute());
      expect(handler.findRoute("get", "/api/test")).not.toBeNull();
    });

    it("should return null for non-matching method", () => {
      handler.addRoute(createRoute());
      expect(handler.findRoute("POST", "/api/test")).toBeNull();
    });

    it("should return null for non-matching url", () => {
      handler.addRoute(createRoute());
      expect(handler.findRoute("GET", "/api/other")).toBeNull();
    });

    it("should match parameterized routes", () => {
      handler.addRoute(
        createRoute({ id: "user-by-id", url: "/api/users/:id" }),
      );
      const found = handler.findRoute("GET", "/api/users/42");
      expect(found).not.toBeNull();
      expect(found!.id).toBe("user-by-id");
    });

    it("should match multiple params", () => {
      handler.addRoute(
        createRoute({ id: "nested", url: "/api/:org/repos/:repoId" }),
      );
      const found = handler.findRoute("GET", "/api/acme/repos/123");
      expect(found).not.toBeNull();
      expect(found!.id).toBe("nested");
    });

    it("should prefer exact match over pattern", () => {
      handler.addRoute(createRoute({ id: "param", url: "/api/users/:id" }));
      handler.addRoute(createRoute({ id: "exact", url: "/api/users/me" }));
      const found = handler.findRoute("GET", "/api/users/me");
      expect(found!.id).toBe("exact");
    });
  });

  describe("clear", () => {
    it("should clear all data", () => {
      handler.addRoute(createRoute());
      handler.addSuite({ id: "s", routes: [] });
      handler.setActiveSuite("s");
      handler.setRouteResponse("test-route", "error");
      handler.clear();
      expect(handler.getRoutes()).toHaveLength(0);
      expect(handler.getSuites()).toHaveLength(0);
      expect(handler.getActiveSuite()).toBeNull();
    });
  });
});
