# @dynamic-mock-server/loguer

Simple wrapper around `pino` to create a consistent logger for the monorepo.

Usage:

```ts
import createLogger from "@dynamic-mock-server/loguer";

const logger = createLogger({ level: "debug" });
logger.info("Hello from loguer");
```

Build:

```
pnpm --filter @dynamic-mock-server/loguer run build
```
