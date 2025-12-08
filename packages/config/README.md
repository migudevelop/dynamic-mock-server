# @dynamic-mock-server/config

Configuration management system for Dynamic Mock Server. Provides centralized configuration loading from multiple file formats with smart defaults and deep merging capabilities.

## Features

## Features

- 🧭 **Multiple Formats**: Load config from JSON, YAML, JS, TS, or CJS files
- 🔎 **Smart Search**: Automatic config file discovery in your project
- 🔀 **Deep Merge**: Extends default configuration with your custom settings
- ✅ **Type Safety**: Full TypeScript support with typed configuration
- ⚠️ **Validation**: Configuration validation and error reporting

## Installation

This package is part of the Dynamic Mock Server monorepo and should be installed via the workspace.

```bash
pnpm install
```

## Usage

### Basic Setup

```typescript
import { Config } from "@dynamic-mock-server/config";

// Create config instance
const config = new Config();

// Load configuration (searches for config file)
const settings = config.getConfig();

console.log(settings.server.port); // 3000 (default) or your custom value
```

### Configuration File

Create a configuration file in your project root with one of these names:

- `dynamicMockServer.config.json`
- `dynamicMockServer.config.yaml`
- `dynamicMockServer.config.yml`
- `dynamicMockServer.config.js`
- `dynamicMockServer.config.ts`
- `dynamicMockServer.config.cjs`

### Example Configuration

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

#### JavaScript Format

```javascript
export default {
  logLevel: "info",
  server: {
    port: process.env.PORT || 4000,
    host: "0.0.0.0",
  },
  routes: {
    selectedSuite: "base",
  },
  files: {
    enabled: true,
    watch: true,
    path: "./mocks",
  },
  plugins: {
    register: [
      // Your custom plugins here
    ],
  },
};
```

#### TypeScript Format

```typescript
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

## Configuration Options

### Root Level

- `logLevel` (string): Logging level - Options: `"fatal"`, `"error"`, `"warn"`, `"info"`, `"debug"`, `"trace"`, `"silent"` (default: `"trace"`)

### Server Configuration

- `server.port` (number): Server port number (default: `3000`)
- `server.host` (string): Server host address (default: `"127.0.0.1"`)

### Routes Configuration

- `routes.selectedSuite` (string): Default active routes suite (default: `"default"`)

### Files Configuration

- `files.enabled` (boolean): Enable/disable file loading system (default: `true`)
- `files.watch` (boolean): Watch files for changes and hot-reload (default: `true`)
- `files.path` (string): Base path for mock files (default: `"mocks"`)

### Plugins Configuration

- `plugins.register` (array): Array of plugins to register (default: `[]`)

## API Reference

### Config Class

Main configuration management class.

#### Methods

##### `loadConfig(): ConfigType`

Searches for and loads configuration file, merging it with defaults.

```typescript
const config = new Config();
const settings = config.loadConfig();
```

##### `getConfig(): ConfigType`

Gets the configuration, loading it if not already loaded (cached). Returns a deep copy to prevent external mutations.

```typescript
const config = new Config();
const settings = config.getConfig();
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

## Configuration Search

The config loader searches for configuration files in this order:

1. `dynamicMockServer.config.json`
2. `dynamicMockServer.config.yaml`
3. `dynamicMockServer.config.yml`
4. `dynamicMockServer.config.js`
5. `dynamicMockServer.config.ts`
6. `dynamicMockServer.config.cjs`

The search starts from the current working directory and stops when a config file is found.

## Examples

### Development Configuration

```javascript
// dynamicMockServer.config.js
export default {
  logLevel: "debug",
  server: {
    port: 3000,
    host: "localhost",
  },
  files: {
    watch: true, // Enable hot-reload for development
  },
};
```

### Production Configuration

```javascript
// dynamicMockServer.config.js
export default {
  logLevel: "error",
  server: {
    port: process.env.PORT || 8080,
    host: "0.0.0.0",
  },
  files: {
    watch: false, // Disable hot-reload for production
  },
};
```

### Custom Mock Path

```javascript
// dynamicMockServer.config.js
export default {
  files: {
    path: "./api-mocks", // Use custom directory for mocks
  },
};
```

## Dependencies

- `cosmiconfig` - Configuration file loader
- `deepmerge` - Deep merge utility for configuration

## Related Packages

- [@dynamic-mock-server/core](../core/README.md) - Uses config for server setup
- [@dynamic-mock-server/logger](../logger/README.md) - Respects logLevel setting

## License

MIT
