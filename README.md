# Dynamic Mock Server

> **Serve and update API mocks instantly with hot-reload support for faster development and testing.**

A powerful development tool built as a TypeScript monorepo for rapidly creating, serving, and updating API mocks with real-time hot-reload functionality. Perfect for frontend developers, QA engineers, and anyone needing to simulate API responses without a backend.

> ⚠️ **Beta**: This project is currently in active beta. APIs, CLI commands, and behavior may change between minor releases. Use caution in production and pin versions when needed.

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

- **[@dynamic-mock-server/eslint-config](./packages/eslint-config)** - Shared ESLint configuration (internal)
- **[@dynamic-mock-server/typescript-config](./packages/typescript-config)** - Shared TypeScript configuration (internal)

### Desktop App

- **[Desktop App](./apps/desktop)** - Cross-platform GUI for managing the mock server (Tauri v2 + React 19)

## 🚀 Quick Start

### Installation

Install the CLI globally to start using the mock server:

```bash
pnpm add -g @dynamic-mock-server/cli
# or
npm install -g @dynamic-mock-server/cli
```

Or add packages individually to your project:

```bash
# Main orchestrator for programmatic usage
pnpm add @dynamic-mock-server/core

# CLI as a dev dependency
pnpm add -D @dynamic-mock-server/cli
```

### Programmatic Usage

```typescript
import { Core } from "@dynamic-mock-server/core";

const core = new Core();

core.mocksManager.addRoute({
  id: "get-users",
  url: "/api/users",
  method: "GET",
  responses: [
    { id: "success", status: 200, body: [{ id: 1, name: "John" }] },
    { id: "error", status: 500, body: { error: "Server Error" } },
  ],
});

await core.start();
// → http://localhost:3000
```

See [@dynamic-mock-server/core](./packages/core) for the full API reference and examples.

### Using the CLI

```bash
# Start the server (reads config automatically)
dynamic-mock-server start

# Enter interactive mode for real-time management
dynamic-mock-server interactive
```

See [@dynamic-mock-server/cli](./packages/cli) for the full command reference and interactive mode documentation.

### File-Based Configuration

Place mock files in a `mocks/` directory and point to them in your config file (`dynamicMockServer.config.json`). See [@dynamic-mock-server/config](./packages/config) and [@dynamic-mock-server/mocks-manager](./packages/mocks-manager) for details.

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
├── apps/
│   └── desktop/         # Cross-platform GUI (Tauri v2 + React 19)
├── packages/
│   ├── core/            # Main orchestrator (Server, Core, PluginManager)
│   ├── mocks-manager/   # Routes, responses, suites, FilesLoader
│   ├── config/          # Configuration with cosmiconfig
│   ├── cli/             # CLI and Interactive CLI
│   ├── logger/          # Pino-based logger
│   ├── alerts/          # Structured alert system
│   ├── eslint-config/   # Shared ESLint config (internal)
│   └── typescript-config/ # Shared TypeScript config (internal)
├── examples/            # Usage examples and mock definitions
├── pnpm-workspace.yaml  # pnpm workspace configuration
├── turbo.json           # TurboRepo task orchestration
└── package.json         # Root dependencies and scripts
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

## 🙏 Acknowledgments

Built with:

- [Fastify](https://fastify.io/) - Fast and low overhead web framework
- [Pino](https://getpino.io/) - Super fast logger
- [Chokidar](https://github.com/paulmillr/chokidar) - File watching
- [@clack/prompts](https://github.com/natemoo-re/clack) - Beautiful CLI prompts
- [Commander.js](https://github.com/tj/commander.js) - Command-line interfaces
- [Cosmiconfig](https://github.com/cosmiconfig/cosmiconfig) - Configuration management
- [TurboRepo](https://turbo.build/) - High-performance monorepo build system

## License

Apache-2.0 © Miguel Martínez

## Credits

Inspired by [mocks-server](https://github.com/mocks-server/main) - A great tool for API mocking.
