# @dynamic-mock-server/core

Core engine for Dynamic Mock Server. Provides the main orchestration layer that coordinates the mock server, configuration, logging, alerts, and plugin system.

## Overview

The Core package is the heart of Dynamic Mock Server, integrating all components into a cohesive system. It manages the Fastify HTTP server, loads configuration, handles mocks through MocksManager, processes plugins, and provides a unified API for server lifecycle management.

## Features

- 🔁 **Server Management**: Start, stop, and restart the Fastify HTTP server
- ⚙️ **Configuration**: Automatic config loading from multiple sources
- 🧩 **Plugin System**: Extensible plugin architecture with hot-reload
- 📝 **Logging**: Integrated pino logger with pretty printing
- ⚠️ **Alerts**: Centralized alert management
- 🔁 **Hot Reload**: Watch mode for config and mock files
- 🌐 **HTTP Server**: Fastify-based with full control
- 📊 **State Management**: Access to all server components

## Installation

```bash
pnpm add @dynamic-mock-server/core
```

## Usage

### Basic Setup

```typescript
import { Core } from "@dynamic-mock-server/core";

// Create a new core instance
const core = new Core();

// Start the server
await core.start();

// Server is now running!
console.log(\`Server running at \${core.server.address()}\`);

// Later, stop the server
await core.stop();
```

See the full README for complete API documentation.

## License

MIT
