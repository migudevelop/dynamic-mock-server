# Dual Package Usage

Dynamic Mock Server supports both ESM and CommonJS module systems.

## ESM (import)

```javascript
import { Core } from "@dynamic-mock-server/core";
import { MocksManager } from "@dynamic-mock-server/mocks-manager";
import { Logger } from "@dynamic-mock-server/logger";
import { Alerts } from "@dynamic-mock-server/alerts";
import { loadConfig } from "@dynamic-mock-server/config";

// Use as needed
const core = new Core({ port: 3000 });
```

## CommonJS (require)

```javascript
const { Core } = require("@dynamic-mock-server/core");
const { MocksManager } = require("@dynamic-mock-server/mocks-manager");
const { Logger } = require("@dynamic-mock-server/logger");
const { Alerts } = require("@dynamic-mock-server/alerts");
const { loadConfig } = require("@dynamic-mock-server/config");

// Use as needed
const core = new Core({ port: 3000 });
```

## Notes

- All packages are built with dual exports for maximum compatibility
- ESM modules are the default entry point
- No ExperimentalWarning when using ESM dependencies
- TypeScript types are available for both module systems
