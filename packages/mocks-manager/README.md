# @dynamic-mock-server/mocks-manager

Manages the lifecycle and organization of mocks in the Dynamic Mock Server, including routes, responses, nested routes suites, and HTTP request handling through Fastify integration.

## Features

- **Route Management**: Add, update, remove, and query routes with their responses
- **Response Management**: Handle multiple responses per route for different scenarios
- **Routes Suites**: Group specific route responses into reusable suites
- **Nested Organization**: Hierarchical organization of routes suites with namespaces
- **Active Suite Management**: Set and manage the active suite to control which responses are used
- **Per-Route Overrides**: Override specific route responses independently of the active suite
- **Fastify Integration**: Automatic HTTP request handling through `RoutesHandler`
- **Responses Handler**: Internal management of route responses resolution
- **Nested Routes Suites**: Hierarchical structure for organizing suites with parent-child relationships

## Installation

This package is part of the Dynamic Mock Server monorepo and should be installed via the workspace.

```bash
pnpm install
```

## Usage

```typescript
import Fastify from "fastify";
import { MocksManager } from "@dynamic-mock-server/mocks-manager";

// Create a new mocks manager instance
const mocksManager = new MocksManager();

// Create Fastify app and integrate with mocks manager
const app = Fastify();
mocksManager.setApp(app);

// Add a route with responses
mocksManager.addRoute({
  id: "get-users",
  url: "/api/users",
  method: "GET",
  responses: [
    {
      id: "success",
      status: 200,
      body: [{ id: 1, name: "John" }],
    },
    {
      id: "error",
      status: 500,
      body: { error: "Internal server error" },
    },
    {
      id: "slow",
      status: 200,
      body: [{ id: 1, name: "John" }],
      delay: 3000, // 3 seconds delay
    },
  ],
});

// Add a routes suite
mocksManager.addSuite({
  id: "happy-path",
  routes: ["get-users:success"],
});

// Set the active suite
mocksManager.setActiveSuite("happy-path");

// Start the server
await app.listen({ port: 3000 });

// The server will now respond to GET /api/users with the "success" response
// Override a specific route response
mocksManager.setRouteResponse("get-users", "error");
// Now GET /api/users will return the error response

// Use nested routes suites for organization
const apiSuites = mocksManager.routesSuites.collection("api");
apiSuites.set("v1-suite", { id: "v1", routes: ["get-users:success"] });
apiSuites.set("v2-suite", { id: "v2", routes: ["get-users:error"] });
```

## Direct Component Usage

You can also use the individual components directly:

```typescript
import {
  RoutesHandler,
  ResponsesHandler,
  NestedRoutesSuites,
} from "@dynamic-mock-server/mocks-manager";

// Use RoutesHandler for Fastify integration
const routesHandler = new RoutesHandler();
routesHandler.setApp(app);

// Use ResponsesHandler for response management
routesHandler.responses.addRoute({
  id: "get-users",
  url: "/api/users",
  method: "GET",
  responses: [
    /* ... */
  ],
});

// Use NestedRoutesSuites for hierarchical organization
const suites = new NestedRoutesSuites();
const apiSuites = suites.collection("api");
apiSuites.set("v1", {
  /* suite config */
});
```

## API

### MocksManager

Main class that orchestrates all mock management functionality.

#### Methods

- `setApp(app: FastifyInstance): void` - Set the Fastify instance for HTTP handling
- `getApp(): FastifyInstance | undefined` - Get the current Fastify instance
- `addRoute(config: RouteConfig): void` - Add or update a route with its responses
- `removeRoute(routeId: string): void` - Remove a route by ID
- `addResponse(routeId: string, response: RouteResponse): void` - Add a response to an existing route
- `removeResponse(routeId: string, responseId: string): void` - Remove a response from a route
- `addSuite(suite: RoutesSuite): void` - Add or update a routes suite
- `removeSuite(suiteId: string): void` - Remove a routes suite
- `setActiveSuite(suiteId: string | null): void` - Set the active routes suite
- `getActiveSuite(): string | null` - Get the current active suite ID
- `setRouteResponse(routeId: string, responseId: string | null): void` - Override response for a specific route
- `getRoutes(): RouteConfig[]` - Get all routes
- `getRoute(routeId: string): RouteConfig | undefined` - Get a specific route by ID
- `getSuites(): RoutesSuite[]` - Get all routes suites
- `getSuite(suiteId: string): RoutesSuite | undefined` - Get a specific suite by ID
- `resolveResponse(routeId: string): RouteResponse | null` - Resolve the active response for a route
- `findRoute(method: string, url: string): RouteConfig | null` - Find a route by method and URL
- `clear(): void` - Clear all routes and suites
- `getStats(): object` - Get statistics about the current mocks state

#### Properties

- `routesSuites: NestedRoutesSuites` - Access the nested routes suites for hierarchical organization
- `routesHandler: RoutesHandler` - Access the routes handler for Fastify integration

### RoutesHandler

Handles HTTP request routing through Fastify integration.

#### Methods

- `setApp(app: FastifyInstance): void` - Set the Fastify instance and register routes
- `getApp(): FastifyInstance | undefined` - Get the Fastify instance
- `isRegistered(): boolean` - Check if routes are registered

#### Properties

- `responses: ResponsesHandler` - Access the responses handler

### ResponsesHandler

Manages route responses and their resolution.

#### Methods

- `addRoute(config: RouteConfig): void` - Add or update a route
- `removeRoute(routeId: string): void` - Remove a route
- `addResponse(routeId: string, response: RouteResponse): void` - Add a response to a route
- `removeResponse(routeId: string, responseId: string): void` - Remove a response
- `addSuite(suite: RoutesSuite): void` - Add a routes suite
- `removeSuite(suiteId: string): void` - Remove a routes suite
- `setActiveSuite(suiteId: string | null): void` - Set the active suite
- `getActiveSuite(): string | null` - Get the active suite
- `setRouteResponse(routeId: string, responseId: string | null): void` - Override route response
- `getRoutes(): RouteConfig[]` - Get all routes
- `getRoute(routeId: string): RouteConfig | undefined` - Get a specific route
- `getSuites(): RoutesSuite[]` - Get all suites
- `getSuite(suiteId: string): RoutesSuite | undefined` - Get a specific suite
- `resolveResponse(routeId: string): RouteResponse | null` - Resolve active response
- `findRoute(method: string, url: string): RouteConfig | null` - Find route by method and URL
- `clear(): void` - Clear all data

### NestedRoutesSuites

Provides hierarchical organization for routes suites with namespaces.

#### Methods

- `set(id: string, value: unknown): void` - Set an item
- `get(id: string): unknown` - Get an item
- `has(id: string): boolean` - Check if item exists
- `remove(id: string): boolean` - Remove an item
- `clean(): void` - Clear all items (preserves children)
- `collection(namespace: string): NestedRoutesSuites` - Get or create a child collection
- `onChange(listener: ChangeListener): UnsubscribeFunction` - Subscribe to changes
- `clear(): void` - Remove all items and children

#### Properties

- `flat: unknown[]` - Get all items recursively
- `values: unknown[]` - Get items from this collection only
- `keys: string[]` - Get all keys
- `size: number` - Get collection size
- `childRoutesSuites: string[]` - Get child collection names

## License

MIT
