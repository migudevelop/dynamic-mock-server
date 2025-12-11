# Dynamic Mock Server

> **Serve and update API mocks instantly with hot-reload support for faster development and testing.**

A powerful development tool built as a TypeScript monorepo for rapidly creating, serving, and updating API mocks with real-time hot-reload functionality. Perfect for frontend developers, QA engineers, and anyone needing to simulate API responses without a backend.

## ✨ Features

- 🔁 **Hot Reload**: Watch mode automatically reloads routes and suites from files without server restart
- 🎯 **Multiple Response Options**: Define multiple responses per route and switch between them on the fly
- 🗂️ **Routes Suites**: Group responses for different scenarios (success, error, loading states)
- 🔄 **Per-Route Overrides**: Override specific route responses while keeping suite defaults
- 🛠️ **Interactive CLI**: Manage your server with an intuitive command-line interface
- 📁 **File-Based Configuration**: Define mocks in JavaScript files with full IDE support
- 🎨 **Beautiful Output**: Colored terminal interface powered by @clack/prompts and picocolors
- ⚡ **Fast**: Built on Fastify for maximum performance
- 📦 **Modular**: Composable packages - use only what you need
- 🔌 **Extensible**: Plugin system for custom functionality
- 📊 **Structured Alerts**: Namespace-based alert system for better error tracking
- 🪵 **Comprehensive Logging**: Pino-based logger with pretty formatting

## 📦 Packages

This monorepo contains the following packages:

### Core Packages

- **[@dynamic-mock-server/core](./packages/core)** - Main orchestrator managing server, plugins, config, and mocks
- **[@dynamic-mock-server/mocks-manager](./packages/mocks-manager)** - Mock management engine handling routes, responses, and suites
- **[@dynamic-mock-server/config](./packages/config)** - Configuration management with cosmiconfig support

### CLI & UI

- **[@dynamic-mock-server/cli](./packages/cli)** - Interactive and programmatic command-line interface

### Infrastructure

- **[@dynamic-mock-server/logger](./packages/logger)** - Pino-based logger with namespacing and pretty formatting
- **[@dynamic-mock-server/alerts](./packages/alerts)** - Structured alert system with namespace support

### Tooling

- **[@dynamic-mock-server/eslint-config](./packages/eslint-config)** - Shared ESLint configuration
- **[@dynamic-mock-server/typescript-config](./packages/typescript-config)** - Shared TypeScript configuration

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/migudevelop/dynamic-mock-server.git
cd dynamic-mock-server

# Install dependencies
pnpm install

# Build all packages
pnpm build
```

### Basic Programmatic Usage

```typescript
import { Core } from "@dynamic-mock-server/core";

// Create and configure the server
const core = new Core();

// Add a route with multiple response options
core.mocksManager.addRoute({
  id: "get-users",
  url: "/api/users",
  method: "GET",
  responses: [
    {
      id: "success",
      statusCode: 200,
      body: [
        { id: 1, name: "John Doe", email: "john@example.com" },
        { id: 2, name: "Jane Smith", email: "jane@example.com" },
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
      body: { error: "Internal Server Error" },
    },
  ],
});

// Create a suite for success scenarios
core.mocksManager.addSuite({
  id: "happy-path",
  routes: {
    "get-users": "success",
  },
});

// Create a suite for error scenarios
core.mocksManager.addSuite({
  id: "error-scenarios",
  routes: {
    "get-users": "error",
  },
});

// Set active suite and start
core.mocksManager.setActiveSuite("happy-path");
await core.start();
// Server running at http://localhost:3000
```

### File-Based Configuration

Create a `mocks` directory with your routes and suites:

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

```javascript
// mocks/routesSuites/base.js
export default {
  id: "base",
  routes: {
    "get-users": "success",
  },
};
```

Configure in `dynamicMockServer.config.json`:

```json
{
  "server": {
    "port": 3000,
    "host": "localhost"
  },
  "files": {
    "enabled": true,
    "path": "mocks",
    "watch": true
  }
}
```

### Using the CLI

```bash
# Start the server (loads config and files automatically)
dynamic-mock-server start

# Enter interactive mode for real-time management
dynamic-mock-server interactive

# Change active routes suite
dynamic-mock-server suites set error-scenarios

# Override a specific route response
dynamic-mock-server routes set get-users empty

# View server status
dynamic-mock-server status
```

## 🛠️ Development

### Prerequisites

- **Node.js** >= 18
- **pnpm** >= 9

### Setup

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run in development mode (watch mode with hot-reload)
pnpm dev

# Lint all packages
pnpm lint

# Format code
pnpm format

# Type check
pnpm check-types
```

### Working with Individual Packages

```bash
# Build a specific package
pnpm --filter @dynamic-mock-server/core build

# Run a package in watch mode
pnpm --filter @dynamic-mock-server/core dev

# Lint a specific package
pnpm --filter @dynamic-mock-server/cli lint
```

### Workspace Structure

```
dynamic-mock-server/
├── packages/
│   ├── core/            # Main orchestrator (Server, Core, PluginManager)
│   ├── mocks-manager/   # Routes, responses, suites, FilesLoader
│   ├── config/          # Configuration with cosmiconfig
│   ├── cli/             # CLI and Interactive CLI
│   ├── logger/          # Pino-based logger
│   ├── alerts/          # Structured alert system
│   ├── eslint-config/   # Shared ESLint config
│   └── typescript-config/ # Shared TypeScript config
├── examples/            # Usage examples and mock definitions
├── pnpm-workspace.yaml  # pnpm workspace configuration
├── turbo.json           # TurboRepo task orchestration
└── package.json         # Root dependencies and scripts
```

## 💻 CLI Features

The CLI package (`@dynamic-mock-server/cli`) provides two modes:

### Interactive Mode

Powered by **@clack/prompts** for beautiful, user-friendly interactions:

- Navigate with arrow keys and selection prompts
- Real-time status updates
- View configuration and statistics
- Change suites and route responses on the fly
- Restart server without losing context
- Graceful exit handling

```bash
dynamic-mock-server interactive
# or shorthand
dynamic-mock-server i
```

### Command Mode

Powered by **Commander.js** for scriptable CLI operations:

```bash
# Server management
dynamic-mock-server start              # Start server with config
dynamic-mock-server start -p 8080      # Start on custom port
dynamic-mock-server start -h 0.0.0.0   # Bind to all interfaces
dynamic-mock-server restart            # Restart the server
dynamic-mock-server stop               # Stop the server
dynamic-mock-server status             # Show current status

# Routes suites
dynamic-mock-server suites list        # List all available suites
dynamic-mock-server suites set <id>    # Activate a suite
dynamic-mock-server suites clear       # Deactivate current suite

# Route overrides
dynamic-mock-server routes list                          # List all routes
dynamic-mock-server routes set <routeId> <responseId>   # Override route response
dynamic-mock-server routes clear <routeId>              # Remove override
```

## 📚 Examples

The [examples](./examples) directory contains:

- **[dual-package-usage.md](./examples/dual-package-usage.md)** - How to use both ESM and CommonJS
- **[mocks/routes/](./examples/mocks/routes/)** - Sample route definitions
- **[mocks/routesSuites/](./examples/mocks/routesSuites/)** - Sample suite configurations
- **[plugins/example-plugin.ts](./examples/plugins/example-plugin.ts)** - Custom plugin implementation

## 🏗️ Architecture

### Core Concepts

1. **Routes**: HTTP endpoints with multiple response options (success, error, loading, etc.)
2. **Responses**: Different response variations for each route with customizable status codes, headers, and bodies
3. **Suites**: Named collections that map each route to a specific response (e.g., "happy-path", "error-scenarios")
4. **Overrides**: Per-route response overrides that take precedence over the active suite
5. **Plugins**: Extensible architecture allowing custom functionality integration

### Component Hierarchy

```
┌─────────────────────────────────────────────────────┐
│                      Core                            │
│  (Orchestrates all components and lifecycle)         │
└──────────────┬──────────────────────────────────────┘
               │
    ┌──────────┼──────────┬──────────┬─────────┐
    │          │          │          │         │
┌───▼───┐ ┌───▼────┐ ┌──▼─────┐ ┌──▼────┐ ┌──▼─────────┐
│Server │ │Config  │ │Logger  │ │Alerts │ │MocksManager│
│(Fastify)│ │(cosmi- │ │(Pino)  │ │(Event │ │            │
│       │ │ config)│ │        │ │system)│ │            │
└───────┘ └────────┘ └────────┘ └───────┘ └─────┬──────┘
                                                  │
                                    ┌─────────────┼─────────────┐
                                    │             │             │
                              ┌─────▼──────┐ ┌───▼────────┐ ┌─▼──────────┐
                              │RoutesHandler│ │RoutesSuites│ │FilesLoader │
                              │            │ │            │ │(Chokidar)  │
                              └────────────┘ └────────────┘ └────────────┘
```

### Data Flow

```
File Changes (Chokidar) → FilesLoader → MocksManager → RoutesHandler → Fastify
                                            ↓
                                         Alerts
                                            ↓
                                         Logger
```

### Plugin System

Plugins can hook into the Core API to extend functionality:

```typescript
import type { Plugin, CoreApi } from "@dynamic-mock-server/core";

export class MyPlugin implements Plugin {
  static id = "my-plugin";

  constructor(private coreApi: CoreApi) {}

  // Called when plugin is registered
  register(coreApi: CoreApi): void {
    // Access config, logger, alerts, mocksManager, server
  }

  // Called during core.init()
  async init(): Promise<void> {
    // Initialize plugin resources
  }

  // Called during core.start()
  async start(): Promise<void> {
    // Start plugin functionality
  }

  // Called during core.stop()
  async stop(): Promise<void> {
    // Cleanup plugin resources
  }
}
```

### Integration Example

```typescript
import { Core } from "@dynamic-mock-server/core";
import { InteractiveCLI } from "@dynamic-mock-server/cli";

// Create core instance with optional configuration
const core = new Core({
  logger: myCustomLogger, // Optional: provide custom logger
  plugins: [MyPlugin], // Optional: register plugins
});

// Programmatically add routes
core.mocksManager.addRoute({
  id: "health-check",
  url: "/health",
  method: "GET",
  responses: [{ id: "ok", statusCode: 200, body: { status: "ok" } }],
});

// Add suites
core.mocksManager.addSuite({
  id: "default",
  routes: { "health-check": "ok" },
});

// Start the server (initializes config, plugins, mocks)
await core.start();

// Optional: Start interactive CLI for management
const cli = new InteractiveCLI(core);
await cli.start();
```

## 🔧 Configuration

Configuration is managed via **cosmiconfig**, supporting multiple formats:

- `dynamicMockServer.config.json`
- `dynamicMockServer.config.js`
- `.dynamicmockserverrc`
- `package.json` (under `dynamicMockServer` key)

### Configuration Options

```typescript
{
  // Server configuration
  "server": {
    "port": 3000,              // Server port
    "host": "localhost"        // Server host
  },

  // File loading configuration
  "files": {
    "enabled": true,           // Enable/disable file loading
    "path": "mocks",           // Base path for mock files
    "watch": true              // Enable hot-reload watch mode
  },

  // Logging configuration
  "logLevel": "info",          // trace | debug | info | warn | error | fatal

  // Plugins configuration
  "plugins": {
    "register": []             // Array of plugin constructors
  }
}
```

## 🧩 Plugin Development

Create custom plugins to extend functionality:

```typescript
import type { Plugin, CoreApi, Core } from "@dynamic-mock-server/core";

export class CustomPlugin implements Plugin {
  static id = "custom-plugin"; // Unique plugin identifier

  private coreApi: CoreApi;
  private core: Core;

  constructor(coreApi: CoreApi, core: Core) {
    this.coreApi = coreApi;
    this.core = core;
  }

  // Optional: Called when plugin is registered
  register(coreApi: CoreApi): void {
    const logger = coreApi.logger.namespace("custom-plugin");
    logger.info("Plugin registered");
  }

  // Optional: Called during core initialization
  async init(): Promise<void> {
    // Initialize resources, register routes, etc.
    this.coreApi.mocksManager.addRoute({
      id: "plugin-route",
      url: "/plugin",
      method: "GET",
      responses: [
        { id: "default", statusCode: 200, body: { plugin: "active" } },
      ],
    });
  }

  // Optional: Called when server starts
  async start(): Promise<void> {
    // Start background tasks, listeners, etc.
  }

  // Optional: Called when server stops
  async stop(): Promise<void> {
    // Cleanup resources
  }
}

// Usage
import { Core } from "@dynamic-mock-server/core";

const core = new Core({
  plugins: [CustomPlugin],
});
```

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`pnpm lint`, `pnpm check-types`)
5. Commit using conventional commits (see below)
6. Push to your fork (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/) enforced by Commitlint:

```
feat(scope): add new feature
fix(scope): bug fix
docs(scope): documentation changes
style(scope): formatting changes (no code changes)
refactor(scope): code refactoring
test(scope): adding or updating tests
chore(scope): maintenance tasks
```

Examples:

```
feat(core): add plugin lifecycle hooks
fix(mocks-manager): handle null active suite
docs(readme): update installation instructions
refactor(logger): simplify namespace creation
```

### Git Hooks

**Husky** manages git hooks automatically:

- **pre-commit**: Runs `lint-staged` (ESLint + Prettier on staged files)
- **commit-msg**: Validates commit message format with Commitlint

### Code Style

- Use **TypeScript** for all code
- Follow the shared ESLint config (`@dynamic-mock-server/eslint-config`)
- Use **kebab-case** for filenames (e.g., `routes-handler.ts`)
- Separate types in `.types.ts` files (e.g., `routes-handler.types.ts`)
- Add JSDoc comments for all public APIs
- Use English for all code, comments, and documentation
- Prefer `async/await` over raw Promises
- Use destructuring where applicable

## 📄 License

ISC © Miguel Martínez

## 🙏 Acknowledgments

Built with:

- [Fastify](https://fastify.io/) - Fast and low overhead web framework
- [Pino](https://getpino.io/) - Super fast logger
- [Chokidar](https://github.com/paulmillr/chokidar) - File watching
- [@clack/prompts](https://github.com/natemoo-re/clack) - Beautiful CLI prompts
- [Commander.js](https://github.com/tj/commander.js) - Command-line interfaces
- [Cosmiconfig](https://github.com/cosmiconfig/cosmiconfig) - Configuration management
- [TurboRepo](https://turbo.build/) - High-performance monorepo build system

## 📞 Support

- 🐛 [Report Issues](https://github.com/migudevelop/dynamic-mock-server/issues)
- 💬 [Discussions](https://github.com/migudevelop/dynamic-mock-server/discussions)
- 📧 Contact: Miguel Martínez

---

Made with ❤️ for developers who need fast, flexible API mocking

- **pre-commit**: Runs lint-staged (format + lint)
- **commit-msg**: Validates commit message format

## License

MIT

## Credits

Inspired by [mocks-server](https://github.com/mocks-server/main) - A great tool for API mocking.

## Support

- [?] [Documentation](./packages)
- [!] [Issue Tracker](https://github.com/migudevelop/dynamic-mock-server/issues)
- [+] [Discussions](https://github.com/migudevelop/dynamic-mock-server/discussions)
