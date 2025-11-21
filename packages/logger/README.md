# @dynamic-mock-server/logger

📝 Simple wrapper around `pino` to create a consistent logger for the monorepo.

## Features

- 📝 **Consistent API**: Unified logger creation across packages
- 🔍 **Structured Logs**: JSON structured logs for production-friendly output
- ⚙️ **Configurable Levels**: Support for `debug`, `info`, `warn`, `error`, etc.

Usage:

```ts
import createLogger from "@dynamic-mock-server/logger";

const logger = createLogger({ level: "debug" });
logger.info("Hello from logger");
```

Build:

```
pnpm --filter @dynamic-mock-server/logger run build
```
