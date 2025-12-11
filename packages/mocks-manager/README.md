# @dynamic-mock-server/mocks-manager

> Mock management engine for the Dynamic Mock Server

Central manager for all mocks in the Dynamic Mock Server. Manages routes, responses, and routes suites with support for multiple response options per route, hierarchical suite organization, per-route overrides, and hot-reload file watching.

## Features

- 🎯 **Route Management**: Add, update, remove, and query routes with multiple response options
- 🔄 **Response Variants**: Define multiple responses per route (success, error, loading, etc.)
- 🗂️ **Routes Suites**: Named collections mapping routes to specific responses
- 📂 **Nested Suites**: Hierarchical organization with namespace support
- ⭐ **Active Suite**: Set which suite controls default route responses
- 🔧 **Per-Route Overrides**: Override specific routes independently of active suite
- ⚡ **Fastify Integration**: Automatic HTTP request handling via RoutesHandler
- 📁 **File Loading**: Load routes and suites from JavaScript files with FilesLoader
- 🔥 **Hot Reload**: Watch mode automatically reloads files on changes (via chokidar)
- 📊 **Statistics**: Get real-time stats on routes, responses, and suites

## Installation

```bash
pnpm add @dynamic-mock-server/mocks-manager
```

## Quick Start

### Basic Usage

```typescript
import { MocksManager } from "@dynamic-mock-server/mocks-manager";
import Fastify from "fastify";

// Create manager and Fastify app
const mocksManager = new MocksManager();
const app = Fastify();
mocksManager.setApp(app);

// Add a route with multiple response options
mocksManager.addRoute({
  id: "get-users",
  url: "/api/users",
  method: "GET",
  responses: [
    {
      id: "success",
      statusCode: 200,
      body: [
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Smith" },
      ],
    },
    {
      id: "empty",
      statusCode: 200,
      body: [],
    },
    {
      id: "error",
      statusCode: 500,
      body: { error: "Internal server error" },
    },
    {
      id: "slow",
      statusCode: 200,
      body: [{ id: 1, name: "John" }],
      delay: 3000, // Simulate slow response
    },
  ],
});

// Add a routes suite
mocksManager.addSuite({
  id: "happy-path",
  routes: {
    "get-users": "success", // Map route to response
  },
});

// Set the active suite
mocksManager.setActiveSuite("happy-path");

// Start server
await app.listen({ port: 3000 });
// GET /api/users now returns "success" response
```

### Per-Route Overrides

```typescript
// Override a specific route without changing the suite
mocksManager.setRouteResponse("get-users", "error");
// GET /api/users now returns "error" response

// Clear override to return to suite default
mocksManager.setRouteResponse("get-users", null);
// GET /api/users returns "success" again (from suite)
```

### Nested Suites Organization

```typescript
// Organize suites hierarchically
const apiSuites = mocksManager.routesSuites.collection("api");
apiSuites.set("v1", {
  id: "api-v1",
  routes: { "get-users": "success" },
});
apiSuites.set("v2", {
  id: "api-v2",
  routes: { "get-users": "empty" },
});

// Access nested suite
const v1Suite = apiSuites.get("v1");
```

### Constructor Options

```typescript
import { MocksManager } from "@dynamic-mock-server/mocks-manager";
import { Config } from "@dynamic-mock-server/config";
import { Logger } from "@dynamic-mock-server/logger";
import { Alerts } from "@dynamic-mock-server/alerts";

const mocksManager = new MocksManager({
  // Optional: Enable file loading with hot-reload
  config: new Config(),
  logger: new Logger(),
  alerts: new Alerts(),

  // Optional: Initial routes
  routes: [
    { id: "route1", url: "/test", method: "GET", responses: [...] }
  ],

  // Optional: Initial suites
  suites: [
    { id: "suite1", routes: { "route1": "response1" } }
  ],

  // Optional: Set active suite immediately
  activeSuite: "suite1",
});

// Initialize and start file watching
await mocksManager.init();
await mocksManager.start();
```

## API Reference

### MocksManager

Main class that orchestrates all mock management functionality.

#### Constructor

```typescript
constructor(options?: MocksManagerOptions)
```

**MocksManagerOptions:**

- `config?: Config` - Configuration instance (enables file loading)
- `logger?: Logger` - Logger instance (enables file loading)
- `alerts?: Alerts` - Alerts instance (enables file loading)
- `routes?: RouteConfig[]` - Initial routes to add
- `suites?: RoutesSuite[]` - Initial suites to add
- `activeSuite?: string` - Initial active suite ID

#### Methods

##### Route Management

- `addRoute(config: RouteConfig): void` - Add or update a route with its responses
- `removeRoute(routeId: string): void` - Remove a route by ID
- `addResponse(routeId: string, response: RouteResponse): void` - Add/update a response for a route
- `removeResponse(routeId: string, responseId: string): void` - Remove a response from a route
- `getRoutes(): RouteConfig[]` - Get all routes
- `getRoute(routeId: string): RouteConfig | undefined` - Get a specific route
- `findRoute(method: string, url: string): RouteConfig | null` - Find route by method and URL

##### Suite Management

- `addSuite(suite: RoutesSuite): void` - Add or update a routes suite
- `removeSuite(suiteId: string): void` - Remove a routes suite
- `setActiveSuite(suiteId: string | null): void` - Set the active suite (null to clear)
- `getActiveSuite(): string | null` - Get current active suite ID
- `getSuites(): RoutesSuite[]` - Get all routes suites
- `getSuite(suiteId: string): RoutesSuite | undefined` - Get a specific suite

##### Response Resolution

- `setRouteResponse(routeId: string, responseId: string | null): void` - Override route response
- `resolveResponse(routeId: string): RouteResponse | null` - Resolve the active response for a route

##### Lifecycle

- `async init(): Promise<void>` - Initialize FilesLoader if configured
- `async start(): Promise<void>` - Start file watching
- `async stop(): Promise<void>` - Stop file watching

##### Fastify Integration

- `setApp(app: FastifyInstance): void` - Set Fastify instance for HTTP handling
- `getApp(): FastifyInstance | undefined` - Get the Fastify instance

##### Utilities

- `clear(): void` - Clear all routes and suites
- `getStats(): MocksStats` - Get statistics about current state

#### Properties

- `routesSuites: NestedRoutesSuites` - Access nested routes suites
- `routesHandler: RoutesHandler` - Access routes handler

### Types

#### RouteConfig

```typescript
interface RouteConfig {
  id: string; // Unique route identifier
  url: string; // Route URL (supports Fastify params)
  method: HttpMethod; // HTTP method (GET, POST, etc.)
  responses: RouteResponse[]; // Array of response options
}
```

#### RouteResponse

```typescript
interface RouteResponse {
  id: string; // Unique response identifier
  statusCode: number; // HTTP status code
  body?: any; // Response body (JSON)
  headers?: Record<string, string>; // Response headers
  delay?: number; // Delay in milliseconds
}
```

#### RoutesSuite

```typescript
interface RoutesSuite {
  id: string; // Unique suite identifier
  routes: Record<string, string>; // Map of routeId -> responseId
}
```

#### MocksStats

```typescript
interface MocksStats {
  totalRoutes: number; // Total number of routes
  totalResponses: number; // Total number of responses
  totalSuites: number; // Total number of suites
  activeSuite: string | null; // Currently active suite
  routeOverrides: number; // Number of per-route overrides
}
```

### FilesLoader

Manages loading of mock files with hot-reload support.

**Automatically initialized when MocksManager is created with config, logger, and alerts.**

#### File Structure

```
mocks/
├── routes/           # Route definitions (.js files)
│   ├── users.js
│   └── products.js
└── routesSuites/     # Suite definitions (.js files)
    ├── base.js
    └── errors.js
```

#### Route File Example

```javascript
// mocks/routes/users.js
export default {
  id: "get-users",
  url: "/api/users",
  method: "GET",
  responses: [
    { id: "success", statusCode: 200, body: [{ id: 1, name: "John" }] },
    { id: "error", statusCode: 500, body: { error: "Server Error" } },
  ],
};
```

#### Suite File Example

```javascript
// mocks/routesSuites/base.js
export default {
  id: "base",
  routes: {
    "get-users": "success",
    "get-products": "success",
  },
};
```

## Complete Example

```typescript
import { MocksManager } from "@dynamic-mock-server/mocks-manager";
import { Config } from "@dynamic-mock-server/config";
import { Logger } from "@dynamic-mock-server/logger";
import { Alerts } from "@dynamic-mock-server/alerts";
import Fastify from "fastify";

// Create MocksManager with file loading
const mocksManager = new MocksManager({
  config: new Config(),
  logger: new Logger(),
  alerts: new Alerts(),
});

// Initialize file loading
await mocksManager.init();

// Add programmatic routes (in addition to file-based ones)
mocksManager.addRoute({
  id: "health",
  url: "/health",
  method: "GET",
  responses: [{ id: "ok", statusCode: 200, body: { status: "ok" } }],
});

// Create and configure Fastify
const app = Fastify();
mocksManager.setApp(app);

// Set active suite
mocksManager.setActiveSuite("base");

// Start file watching
await mocksManager.start();

// Start server
await app.listen({ port: 3000 });

console.log("Server running at http://localhost:3000");
console.log("Stats:", mocksManager.getStats());

// Later: stop file watching
await mocksManager.stop();
```

## Architecture

```
MocksManager
  ├── RoutesHandler (Fastify integration)
  │   └── ResponsesHandler (response resolution)
  ├── NestedRoutesSuites (hierarchical organization)
  └── FilesLoader (file loading with chokidar)
```

## Dependencies

- `fastify` - HTTP server framework
- `chokidar` - File watching for hot-reload
- `fast-glob` - File discovery
- `@dynamic-mock-server/config` - Configuration management (optional)
- `@dynamic-mock-server/logger` - Logging (optional)
- `@dynamic-mock-server/alerts` - Alerts system (optional)

## Related Packages

- [@dynamic-mock-server/core](../core) - Core orchestrator
- [@dynamic-mock-server/config](../config) - Configuration management
- [@dynamic-mock-server/logger](../logger) - Logging utilities

## License
 
Apache-2.0 © Miguel Martínez
