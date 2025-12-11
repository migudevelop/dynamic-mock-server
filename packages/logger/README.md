# @dynamic-mock-server/logger

> Pino-based logger with pretty formatting and namespacing

Lightweight logger wrapper around Pino with pino-pretty for beautiful terminal output. Provides namespacing for organized logging across different modules.

## Features

- 📝 **Pino-Based**: Built on high-performance Pino logger
- 🎨 **Pretty Output**: Colorized, readable logs with pino-pretty
- 🏷️ **Namespacing**: Create child loggers with namespace bindings
- 🎯 **Log Levels**: Full support for trace, debug, info, warn, error, fatal
- ⚙️ **Configurable**: Custom log levels and options
- 🚀 **Fast**: Zero-cost abstractions over Pino

## Installation

```bash
pnpm add @dynamic-mock-server/logger
```

## Quick Start

### Basic Usage

```typescript
import { Logger } from "@dynamic-mock-server/logger";

// Create logger with default settings
const logger = new Logger();

logger.info("Server started");
logger.debug("Loading configuration");
logger.warn("Deprecation warning");
logger.error("Failed to load file");
```

### With Log Level

```typescript
import { Logger } from "@dynamic-mock-server/logger";

const logger = new Logger({ level: "debug" });

logger.trace("Very detailed"); // Won't show (below debug)
logger.debug("Debugging info"); // Shows
logger.info("Information"); // Shows
```

### Namespaced Loggers

```typescript
import { Logger } from "@dynamic-mock-server/logger";

const logger = new Logger();

// Create namespaced loggers
const routesLogger = logger.namespace("routes");
const pluginsLogger = logger.namespace("plugins");

routesLogger.info("Route registered");
// Output: [routes] Route registered

pluginsLogger.info("Plugin loaded");
// Output: [plugins] Plugin loaded
```

### Child Loggers with Bindings

```typescript
import { Logger } from "@dynamic-mock-server/logger";

const logger = new Logger();

// Create child with custom bindings
const requestLogger = logger.child({ requestId: "abc123", userId: "user1" });

requestLogger.info("Processing request");
// Output includes: requestId: "abc123", userId: "user1"
```

## API Reference

### Logger Class

#### Constructor

```typescript
constructor(options?: LoggerOptions)
```

**LoggerOptions:**

- `level?: string` - Log level (trace, debug, info, warn, error, fatal). Default: `"info"`
- `options?: pino.LoggerOptions` - Additional Pino options

#### Log Methods

##### `trace(...args: Parameters<LogFn>)`

##### `debug(...args: Parameters<LogFn>)`

##### `info(...args: Parameters<LogFn>)`

##### `warn(...args: Parameters<LogFn>)`

##### `error(...args: Parameters<LogFn>)`

##### `fatal(...args: Parameters<LogFn>)`

Log at different levels.

```typescript
logger.info("Simple message");
logger.info({ userId: 123 }, "User logged in");
logger.error({ err: error }, "Failed to process");
```

#### Utility Methods

##### `child(bindings?: Record<string, unknown>): Logger`

Create a child logger with additional bindings.

```typescript
const childLogger = logger.child({ module: "auth" });
childLogger.info("Authentication successful");
```

##### `namespace(name: string): Logger`

Create a namespaced logger (shorthand for `child({ namespace: name })`).

```typescript
const apiLogger = logger.namespace("api");
apiLogger.info("API request received");
```

##### `get raw(): pino.Logger`

Access the underlying Pino logger instance.

```typescript
const pinoLogger = logger.raw;
```

## Log Levels

Available log levels (in order of severity):

1. `trace` - Very detailed debugging
2. `debug` - Detailed debugging
3. `info` - General information (default)
4. `warn` - Warnings
5. `error` - Errors
6. `fatal` - Fatal errors

Set via environment variable:

```bash
LOG_LEVEL=debug npm start
```

Or via constructor:

```typescript
const logger = new Logger({ level: "debug" });
```

## Examples

### Complete Server Logging

```typescript
import { Logger } from "@dynamic-mock-server/logger";

const logger = new Logger({ level: process.env.LOG_LEVEL || "info" });

// Module-specific loggers
const serverLogger = logger.namespace("server");
const routesLogger = logger.namespace("routes");
const dbLogger = logger.namespace("database");

serverLogger.info("Starting server on port 3000");
routesLogger.info("Loaded 15 routes");
dbLogger.warn("Connection pool nearing capacity");
```

### Request Logging

```typescript
import { Logger } from "@dynamic-mock-server/logger";

const logger = new Logger();

function handleRequest(req: Request) {
  const requestLogger = logger.child({
    requestId: req.id,
    method: req.method,
    url: req.url,
  });

  requestLogger.info("Request started");

  try {
    // Process request
    requestLogger.info("Request completed");
  } catch (error) {
    requestLogger.error({ err: error }, "Request failed");
  }
}
```

## Dependencies

- `pino` - High-performance logger
- `pino-pretty` - Pretty formatting for development

## Related Packages

- [@dynamic-mock-server/core](../core) - Uses logger for all core operations
- [@dynamic-mock-server/config](../config) - Respects `logLevel` config

## License

ISC © Miguel Martínez
