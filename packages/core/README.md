# @dynamic-mock-server/core

> Core orchestrator for the Dynamic Mock Server

The main package that coordinates all components of the mock server including server initialization, configuration management, plugin system, and lifecycle orchestration.

## Features

- 🎯 **Central Orchestration**: Manages all core systems (server, config, mocks, plugins)
- 🔌 **Plugin System**: Extensible architecture with lifecycle hooks (register, init, start, stop)
- 🚀 **Fastify Integration**: High-performance HTTP server powered by Fastify
- 🔄 **Lifecycle Management**: Coordinated initialization, startup, and shutdown of all components
- 📦 **Modular Design**: Clean separation of concerns with dependency injection
- 🎨 **Core API**: Unified interface for plugins to access core functionality

## Installation

```bash
pnpm add @dynamic-mock-server/core
```

## Quick Start

### Basic Usage

```typescript
import { Core } from "@dynamic-mock-server/core";

// Create and start the server
const core = new Core();
await core.start();

// Server is now running at http://localhost:3000
```

### With Routes and Suites

```typescript
import { Core } from "@dynamic-mock-server/core";

const core = new Core();

// Add routes
core.mocksManager.addRoute({
  id: "get-users",
  url: "/api/users",
  method: "GET",
  responses: [
    {
      id: "success",
      status: 200,
      body: [{ id: 1, name: "John Doe" }],
    },
    {
      id: "error",
      status: 500,
      body: { error: "Internal Server Error" },
    },
  ],
});

// Add a suite
core.mocksManager.addSuite({
  id: "base",
  routes: {
    "get-users": "success",
  },
});

// Set active suite and start
core.mocksManager.setActiveSuite("base");
await core.start();
```

### With Custom Logger

```typescript
import { Core } from "@dynamic-mock-server/core";
import { Logger } from "@dynamic-mock-server/logger";

const customLogger = new Logger({ level: "debug" });

const core = new Core({
  logger: customLogger,
});

await core.start();
```

### With Plugins

```typescript
import { Core } from "@dynamic-mock-server/core";
import type { Plugin, CoreApi } from "@dynamic-mock-server/core";

// Define a custom plugin
class MyPlugin implements Plugin {
  static id = "my-plugin";

  constructor(
    private coreApi: CoreApi,
    private core: Core,
  ) {}

  register(coreApi: CoreApi): void {
    const logger = coreApi.logger.namespace("my-plugin");
    logger.info("Plugin registered");
  }

  async init(): Promise<void> {
    // Initialize plugin
  }

  async start(): Promise<void> {
    // Start plugin
  }

  async stop(): Promise<void> {
    // Cleanup
  }
}

// Use the plugin
const core = new Core({
  plugins: { register: [MyPlugin] },
});

await core.start();
```

## API Reference

### Core Class

The main orchestrator class that manages all components.

#### Constructor

```typescript
constructor(options?: CoreOptions)
```

**CoreOptions:**

- `config?: Config` - Custom Config instance (optional)
- `logger?: Logger | false` - Custom logger instance, or `false` to disable logging (optional)
- `plugins?: { register?: PluginConstructor[] }` - Plugin configuration object (optional)

#### Methods

##### `async init(): Promise<void>`

Initialize the core and all plugins. Loads configuration, initializes MocksManager, and registers plugins.

##### `async start(): Promise<void>`

Start the server and all plugins. Calls `init()` internally if not already initialized.

##### `async stop(): Promise<void>`

Stop the server and all plugins. Ensures graceful shutdown.

#### Properties

- `server: Server` - Access the Fastify server instance wrapper
- `config: Config` - Access the configuration manager
- `logger: Logger` - Access the logger instance
- `alerts: Alerts` - Access the alerts system
- `mocksManager: MocksManager` - Access the mocks manager
- `pluginManager: PluginManager` - Access the plugin manager
- `version: string` - Current version of the core package

### Plugin System

Create custom plugins to extend functionality:

```typescript
interface Plugin {
  register?(coreApi: CoreApi): void;
  init?(): Promise<void>;
  start?(): Promise<void>;
  stop?(): Promise<void>;
}

interface PluginConstructor {
  id: string; // Unique plugin identifier
  new (coreApi: CoreApi, core: Core): Plugin;
}

interface CoreApi {
  config: Config;
  logger: Logger;
  alerts: Alerts;
  mocksManager: MocksManager;
  server: Server;
  version: string;
}
```

## Architecture

### Component Flow

```
Core (Orchestrator)
  ├── Config (Configuration Management)
  ├── Logger (Logging System)
  ├── Alerts (Alert Management)
  ├── MocksManager (Routes & Suites)
  ├── Server (Fastify HTTP Server)
  └── PluginManager (Plugin Lifecycle)
```

### Lifecycle Sequence

1. **Construction**: Core instantiates all components
2. **Registration**: Plugins are registered with PluginManager
3. **Initialization** (`init()`):
   - Config loads configuration files
   - MocksManager initializes and loads files
   - Plugins are registered and initialized
4. **Start** (`start()`):
   - Server starts listening
   - MocksManager starts file watching
   - Plugins are started
5. **Stop** (`stop()`):
   - Plugins are stopped
   - MocksManager stops file watching
   - Server closes gracefully

## Dependencies

- `@dynamic-mock-server/config` - Configuration management
- `@dynamic-mock-server/logger` - Logging utilities
- `@dynamic-mock-server/alerts` - Alert system
- `@dynamic-mock-server/mocks-manager` - Mock management
- `fastify` - HTTP server framework

## Related Packages

- [@dynamic-mock-server/cli](../cli) - Command-line interface
- [@dynamic-mock-server/mocks-manager](../mocks-manager) - Mock management engine
- [@dynamic-mock-server/config](../config) - Configuration management

## License

Apache-2.0 © Miguel Martínez
