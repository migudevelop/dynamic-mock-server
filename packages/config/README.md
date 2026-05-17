# @dynamic-mock-server/config

> Configuration management for the Dynamic Mock Server

Centralized configuration system with automatic file discovery, multiple format support, and deep merging of defaults with user settings. Uses cosmiconfig for flexible configuration loading.

## Features

- 🔍 **Auto-Discovery**: Automatically finds config files in your project
- 📝 **Multiple Formats**: Supports JSON, JS, CJS, TypeScript, YAML, and package.json
- 🔀 **Deep Merge**: Smart merging of user config with sensible defaults
- ✅ **Type Safety**: Full TypeScript support with typed configuration
- 🎯 **Simple API**: Load once, use everywhere with caching
- 📁 **Flexible Paths**: Customizable config file search locations

## Installation

```bash
pnpm add @dynamic-mock-server/config
```

## Quick Start

### Basic Usage

```typescript
import { Config } from "@dynamic-mock-server/config";

// Create config instance
const config = new Config();

// Get configuration (automatically loads and caches)
const settings = config.getConfig();

console.log(settings.server.port); // 3000 (default) or your custom value
console.log(settings.logLevel); // "info" or your custom level
```

### Supported Config Files

Create a configuration file in your project root with one of these names:

- `dynamicMockServer.config.json`
- `dynamicMockServer.config.js`
- `dynamicMockServer.config.cjs`
- `dynamicMockServer.config.ts` (requires loader)
- `dynamicMockServer.config.yaml`
- `dynamicMockServer.config.yml`
- `.dynamicmockserverrc` (JSON or YAML)
- `.dynamicmockserverrc.json`
- `.dynamicmockserverrc.yaml`
- `.dynamicmockserverrc.yml`
- `.dynamicmockserverrc.js`
- `.dynamicmockserverrc.cjs`
- `package.json` (under `"dynamicMockServer"` key)

### Example Configurations

#### JSON Format

```json
{
  "logLevel": "info",
  "server": {
    "port": 4000,
    "host": "0.0.0.0"
  },
  "routes": {
    "selectedSuite": "base"
  },
  "files": {
    "enabled": true,
    "watch": true,
    "path": "./mocks"
  }
}
```

#### JavaScript/ES Module Format

```javascript
// dynamicMockServer.config.js
export default {
  logLevel: "info",
  server: {
    port: parseInt(process.env.PORT) || 4000,
    host: process.env.HOST || "localhost",
  },
  routes: {
    selectedSuite: "base",
  },
  files: {
    enabled: true,
    watch: process.env.NODE_ENV === "development",
    path: "./mocks",
  },
  plugins: {
    register: [],
  },
};
```

#### TypeScript Format

```typescript
// dynamicMockServer.config.ts
import type { ConfigType } from "@dynamic-mock-server/config";

const config: ConfigType = {
  logLevel: "debug",
  server: {
    port: 3000,
    host: "127.0.0.1",
  },
  routes: {
    selectedSuite: "default",
  },
  files: {
    enabled: true,
    watch: true,
    path: "./mocks",
  },
};

export default config;
```

#### package.json Format

```json
{
  "name": "my-project",
  "dynamicMockServer": {
    "server": {
      "port": 3000
    },
    "logLevel": "info"
  }
}
```

## Configuration Options

### Complete Type Definition

```typescript
interface ConfigType {
  logLevel: "fatal" | "error" | "warn" | "info" | "debug" | "trace" | "silent";
  server: {
    port: number;
    host: string;
  };
  routes: {
    selectedSuite: string;
  };
  files: {
    enabled: boolean;
    watch: boolean;
    path: string;
  };
  plugins: {
    register?: PluginConstructor[];
  };
}
```

> **Note**: The full `ConfigType` is always fully populated after loading. Your config file can provide a partial subset — the rest is filled with defaults via deep merge.

### Option Details

#### `logLevel` (string)

Logging level for the application.

- **Options**: `"fatal"` | `"error"` | `"warn"` | `"info"` | `"debug"` | `"trace"` | `"silent"`
- **Default**: `"trace"`

#### `server.port` (number)

Port number for the HTTP server.

- **Default**: `3000`
- **Example**: `4000`, `8080`

#### `server.host` (string)

Host address for the HTTP server.

- **Default**: `"127.0.0.1"`
- **Examples**: `"localhost"`, `"0.0.0.0"` (bind to all interfaces)

#### `routes.selectedSuite` (string)

Default active routes suite on startup.

- **Default**: `"default"`
- **Example**: `"happy-path"`, `"error-scenarios"`

#### `files.enabled` (boolean)

Enable or disable file-based mock loading.

- **Default**: `true`

#### `files.watch` (boolean)

Enable hot-reload watching of mock files.

- **Default**: `true`

#### `files.path` (string)

Base directory for mock files (routes and suites).

- **Default**: `"mocks"`
- **Example**: `"./fixtures"`, `"src/mocks"`

#### `plugins.register` (PluginConstructor[])

Array of plugin constructors to register on startup.

- **Default**: `[]`

## API Reference

### Config Class

#### Constructor

```typescript
constructor();
```

No options required. Config discovery is automatic.

#### Methods

##### `loadConfig(): ConfigType`

Searches for and loads configuration file, merging it with defaults. Called automatically by `getConfig()`.

```typescript
const config = new Config();
const settings = config.loadConfig();
```

##### `getConfig(): ConfigType`

Gets the configuration, loading it if not already loaded (cached). Returns a deep copy to prevent external mutations.

```typescript
const config = new Config();
const settings = config.getConfig();

// Safe to modify - original config is protected
settings.server.port = 5000; // Doesn't affect cached config
```

## Default Configuration

If no configuration file is found, these defaults are used:

```typescript
{
  logLevel: "trace",
  plugins: {
    register: [],
  },
  server: {
    port: 3000,
    host: "127.0.0.1",
  },
  routes: {
    selectedSuite: "default",
  },
  files: {
    enabled: true,
    watch: true,
    path: "mocks",
  },
}
```

## How It Works

### Config Discovery

Uses **cosmiconfig** to search for configuration files in this order:

1. `dynamicMockServer.config.json`
2. `dynamicMockServer.config.js`
3. `dynamicMockServer.config.cjs`
4. `.dynamicmockserverrc` (JSON or YAML)
5. `.dynamicmockserverrc.json`
6. `.dynamicmockserverrc.yaml`
7. `.dynamicmockserverrc.js`
8. `package.json` (under `dynamicMockServer` key)

The search starts from `process.cwd()` and stops when a config file is found.

### Deep Merging

User configuration is deeply merged with defaults:

```typescript
// Default config
{
  server: { port: 3000, host: "127.0.0.1" },
  logLevel: "trace"
}

// User config
{
  server: { port: 8080 }
}

// Result
{
  server: { port: 8080, host: "127.0.0.1" }, // Merged!
  logLevel: "trace"
}
```

### Immutability

Config returns deep copies to prevent accidental mutations:

```typescript
const config = new Config();
const settings1 = config.getConfig();
settings1.server.port = 9999; // Doesn't affect cache

const settings2 = config.getConfig();
console.log(settings2.server.port); // Still 3000 (or your config value)
```

## Examples

### Environment-Based Configuration

```javascript
// dynamicMockServer.config.js
const isDev = process.env.NODE_ENV === "development";

export default {
  logLevel: isDev ? "debug" : "error",
  server: {
    port: parseInt(process.env.PORT) || 3000,
    host: isDev ? "localhost" : "0.0.0.0",
  },
  files: {
    watch: isDev, // Hot-reload only in development
  },
};
```

### Custom Mock Directory

```javascript
// dynamicMockServer.config.js
export default {
  files: {
    path: "./fixtures/api-mocks",
  },
};
```

### With Plugins

```javascript
// dynamicMockServer.config.js
import { MyCustomPlugin } from "./plugins/my-custom-plugin.js";

export default {
  logLevel: "info",
  plugins: {
    register: [MyCustomPlugin],
  },
};
```

## Dependencies

- `cosmiconfig` - Configuration file discovery and loading
- `deepmerge` - Deep object merging utility

## Related Packages

- [@dynamic-mock-server/core](../core) - Main package that uses Config
- [@dynamic-mock-server/logger](../logger) - Respects `logLevel` setting
- [@dynamic-mock-server/mocks-manager](../mocks-manager) - Uses `files` settings

## License

Apache-2.0 © Miguel Martínez
