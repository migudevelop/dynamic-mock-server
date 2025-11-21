# Dynamic Mock Server

A powerful development tool for rapidly creating, serving, and updating API mocks with hot-reload functionality. Built as a TypeScript monorepo with pnpm workspaces.

## Features

- 🚀 **Hot Reload**: See changes in real-time without restarting
- 🎯 **Multiple Response Options**: Define multiple responses per route
- 🔄 **Routes Suites**: Group responses for different scenarios
- 🛠️ **Interactive CLI**: Manage your server from the command line
- 🎨 **Beautiful Output**: Colored terminal interface with picocolors
- ⚡ **Fast**: Built on Fastify for maximum performance
- 📦 **Modular**: Pick and choose only what you need
- 🔌 **Extensible**: Plugin system for custom functionality

## Packages

This monorepo contains the following packages:

- **[@dynamic-mock-server/core](./packages/core)** - Core server functionality
- **[@dynamic-mock-server/cli](./packages/cli)** - Interactive command-line interface ⭐ NEW!
- **[@dynamic-mock-server/config](./packages/config)** - Configuration management
- **[@dynamic-mock-server/logger](./packages/logger)** - Logging utilities
- **[@dynamic-mock-server/alerts](./packages/alerts)** - Alert system
- **[@dynamic-mock-server/mocks-manager](./packages/mocks-manager)** - Mock management engine
- **[@dynamic-mock-server/eslint-config](./packages/eslint-config)** - Shared ESLint config
- **[@dynamic-mock-server/typescript-config](./packages/typescript-config)** - Shared TypeScript config

## Quick Start

### Installation

```bash
# Install all dependencies
pnpm install

# Build all packages
pnpm build
```

### Basic Usage

```typescript
import { Core } from "@dynamic-mock-server/core";

const core = new Core();

// Add a route
core.mocksManager.addRoute({
  id: "get-users",
  url: "/api/users",
  method: "GET",
  responses: [
    {
      id: "success",
      statusCode: 200,
      body: [{ id: 1, name: "John Doe" }],
    },
    {
      id: "error",
      statusCode: 500,
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

// Start the server
await core.start();
```

### Using the CLI

```bash
# Start the server
dynamic-mock-server start

# Enter interactive mode
dynamic-mock-server interactive

# Change routes suite
dynamic-mock-server suites set base

# List routes
dynamic-mock-server routes list
```

## Development

### Prerequisites

- Node.js >= 18
- pnpm >= 9

### Setup

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run in development mode (watch)
pnpm dev

# Lint
pnpm lint

# Type check
pnpm check-types
```

### Workspace Structure

```
dynamic-mock-server/
├── packages/
│   ├── alerts/          # Alert system
│   ├── cli/             # Command-line interface
│   ├── config/          # Configuration management
│   ├── core/            # Core server functionality
│   ├── eslint-config/   # Shared ESLint config
│   ├── logger/          # Logging utilities
│   ├── mocks-manager/   # Mock management engine
│   └── typescript-config/ # Shared TypeScript config
├── examples/            # Usage examples
├── pnpm-workspace.yaml  # Workspace configuration
├── turbo.json           # Turbo configuration
└── package.json         # Root package.json
```

## CLI Features

The new CLI package provides:

- **Interactive Mode**: Navigate through options with @clack/prompts
- **Command Mode**: Use Commander.js for programmatic control
- **Hot Reload**: Change suites and routes without restart
- **Colored Output**: Beautiful terminal UI with picocolors
- **Status Display**: Real-time server information
- **Suite Management**: Switch between route suites
- **Route Override**: Change specific route responses on the fly
- **Server Control**: Start, stop, and restart the server

### CLI Commands

```bash
# Server management
dynamic-mock-server start [options]    # Start the server
dynamic-mock-server restart            # Restart the server
dynamic-mock-server status             # Show server status

# Interactive mode
dynamic-mock-server interactive        # Enter interactive mode
dynamic-mock-server i                  # Alias for interactive

# Suites management
dynamic-mock-server suites list        # List all suites
dynamic-mock-server suites set <id>    # Set active suite
dynamic-mock-server suites clear       # Clear active suite

# Routes management
dynamic-mock-server routes list        # List all routes
dynamic-mock-server routes set <routeId> <responseId>  # Set route response
dynamic-mock-server routes clear <routeId>             # Clear route override
```

## Examples

Check out the [examples](./examples) directory for:

- Basic usage examples
- CLI usage examples
- Plugin examples
- Dual package usage
- Route and suite configurations

## Architecture

### Core Concepts

1. **Routes**: HTTP endpoints with multiple response options
2. **Responses**: Different response variations for each route
3. **Suites**: Collections that map routes to specific responses
4. **Overrides**: Per-route response overrides that take precedence over suites

### Integration

```typescript
import { Core } from "@dynamic-mock-server/core";
import { CLI } from "@dynamic-mock-server/cli";

// Create core instance
const core = new Core({
  config: {
    server: {
      port: 3000,
      host: "localhost",
    },
  },
});

// Add your routes and suites
core.mocksManager.addRoute({...});
core.mocksManager.addSuite({...});

// Start the server
await core.start();

// Start the CLI for management
const cli = new CLI({ core });
await cli.start();
```

## Contributing

Contributions are welcome! Please read our contributing guidelines first.

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting changes
refactor: code refactoring
test: adding tests
chore: maintenance
```

### Git Hooks

We use Husky for git hooks:

- **pre-commit**: Runs lint-staged (format + lint)
- **commit-msg**: Validates commit message format

## License

MIT

## Credits

Inspired by [mocks-server](https://github.com/mocks-server/main) - A great tool for API mocking.

## Support

- 📖 [Documentation](./packages)
- 🐛 [Issue Tracker](https://github.com/migudevelop/dynamic-mock-server/issues)
- 💬 [Discussions](https://github.com/migudevelop/dynamic-mock-server/discussions)
