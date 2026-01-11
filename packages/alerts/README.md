# @dynamic-mock-server/alerts

> Structured alert management system with namespace support

Hierarchical alert system for organizing warnings, errors, and notifications. Built on NestedRoutesSuites from mocks-manager, providing powerful namespace organization and change notifications.

## Features

- 🗂️ **Hierarchical Organization**: Namespace alerts by module or context
- 🔔 **Change Notifications**: Subscribe to alert updates with event listeners
- 📝 **Structured Details**: Capture error stack traces and metadata
- 🔍 **Flat Access**: Query all alerts across all namespaces
- ⚡ **Fast Lookups**: Efficient get/set/has/remove operations
- 🧹 **Easy Cleanup**: Remove individual alerts or clear entire collections

## Installation

```bash
pnpm add @dynamic-mock-server/alerts
```

## Quick Start

### Basic Usage

```typescript
import { Alerts } from "@dynamic-mock-server/alerts";

const alerts = new Alerts();

// Set a simple alert
alerts.set("config-warning", "Configuration file not found");

// Get an alert
const alert = alerts.get("config-warning");
console.log(alert); // { id: "config-warning", message: "...", error?: {...} }

// Check if alert exists
if (alerts.has("config-warning")) {
  console.log("Warning active");
}

// Remove an alert
alerts.remove("config-warning");
```

### Alerts with Errors

```typescript
import { Alerts } from "@dynamic-mock-server/alerts";

const alerts = new Alerts();

try {
  throw new Error("Connection timeout");
} catch (error) {
  alerts.set("db-error", "Failed to connect to database", error);
}

const alert = alerts.get("db-error");
console.log(alert);
// {
//   id: "db-error",
//   message: "Failed to connect to database",
//   error: {
//     name: "Error",
//     message: "Connection timeout",
//     stack: "Error: Connection timeout\n  at ..."
//   }
// }
```

### Namespaced Alerts

```typescript
import { Alerts } from "@dynamic-mock-server/alerts";

const alerts = new Alerts();

// Create namespaced alert collections
const routeAlerts = alerts.collection("routes");
const pluginAlerts = alerts.collection("plugins");

routeAlerts.set("not-found", "Route '/api/users' not found");
pluginAlerts.set("load-error", "Failed to load plugin 'auth'");

// Get all alerts (across all namespaces)
const allAlerts = alerts.flat;
console.log(allAlerts.length); // 2

// Get alerts from specific namespace
const routeAlertsOnly = routeAlerts.values;
```

### Change Notifications

```typescript
import { Alerts } from "@dynamic-mock-server/alerts";

const alerts = new Alerts();

// Subscribe to changes
const unsubscribe = alerts.onChange((action, id, value) => {
  console.log(`Alert ${action}: ${id}`);
  // action: "set" | "remove" | "clean" | "clear"
});

alerts.set("warning-1", "Test warning"); // Logs: "Alert set: warning-1"
alerts.remove("warning-1"); // Logs: "Alert remove: warning-1"

// Unsubscribe when done
unsubscribe();
```

## API Reference

### Alerts Class

Extends `NestedRoutesSuites` from mocks-manager with alert-specific functionality.

#### Methods

##### `set(id: string, message: string, error?: Error): void`

Set an alert with optional error details.

```typescript
alerts.set("alert-1", "Something went wrong");
alerts.set("alert-2", "Database error", new Error("Connection failed"));
```

**Throws:**

- Error if `id` is not a non-empty string
- Error if `message` is not a non-empty string

##### `get(id: string): Alert | undefined`

Get an alert by ID.

```typescript
const alert = alerts.get("alert-1");
if (alert) {
  console.log(alert.message);
}
```

##### `has(id: string): boolean`

Check if an alert exists.

```typescript
if (alerts.has("warning-1")) {
  console.log("Warning is active");
}
```

##### `remove(id: string): boolean`

Remove an alert by ID. Returns `true` if removed, `false` if not found.

```typescript
const removed = alerts.remove("alert-1");
```

##### `clean(): void`

Clear all alerts in this collection (preserves child collections).

```typescript
alerts.clean();
```

##### `clear(): void`

Clear all alerts and child collections recursively.

```typescript
alerts.clear();
```

##### `collection(namespace: string): Alerts`

Get or create a namespaced alert collection.

```typescript
const fileAlerts = alerts.collection("files");
fileAlerts.set("not-found", "File missing");
```

##### `onChange(listener: ChangeListener): UnsubscribeFunction`

Subscribe to alert changes. Returns unsubscribe function.

```typescript
const unsubscribe = alerts.onChange((action, id, value) => {
  console.log(`Alert ${action}: ${id}`);
});

// Later...
unsubscribe();
```

**ChangeListener signature:**

```typescript
type ChangeListener = (
  action: "set" | "remove" | "clean" | "clear",
  id: string,
  value?: unknown
) => void;
```

#### Properties

##### `flat: Alert[]`

Get all alerts recursively from this collection and all child collections.

```typescript
const allAlerts = alerts.flat;
console.log(`Total alerts: ${allAlerts.length}`);
```

##### `values: Alert[]`

Get alerts only from this collection (not including child collections).

```typescript
const thisLevelAlerts = alerts.values;
```

##### `keys: string[]`

Get all alert IDs in this collection.

```typescript
const alertIds = alerts.keys;
```

##### `size: number`

Get the number of alerts in this collection.

```typescript
console.log(`Alert count: ${alerts.size}`);
```

##### `childRoutesSuites: string[]`

Get names of child alert collections.

```typescript
const namespaces = alerts.childRoutesSuites;
console.log(`Namespaces: ${namespaces.join(", ")}`);
```

### Types

#### Alert

```typescript
interface Alert {
  /** Unique alert identifier */
  id: string;

  /** Human-readable alert message */
  message: string;

  /** Optional error details */
  error?: {
    /** Error name */
    name: string;

    /** Error message */
    message: string;

    /** Error stack trace */
    stack: string;
  };
}
```

## Examples

### Module-Specific Alerts

```typescript
import { Alerts } from "@dynamic-mock-server/alerts";

const alerts = new Alerts();

// Organize by module
const serverAlerts = alerts.collection("server");
const dbAlerts = alerts.collection("database");
const cacheAlerts = alerts.collection("cache");

serverAlerts.set("port-in-use", "Port 3000 is already in use");
dbAlerts.set("connection-lost", "Lost connection to database");
cacheAlerts.set("eviction", "Cache nearing capacity");

// Get all alerts
console.log(`Total system alerts: ${alerts.flat.length}`);
```

### Alert Dashboard

```typescript
import { Alerts } from "@dynamic-mock-server/alerts";

const alerts = new Alerts();

function displayAlerts() {
  const allAlerts = alerts.flat;

  if (allAlerts.length === 0) {
    console.log("No alerts");
    return;
  }

  console.log(`\n=== Active Alerts (${allAlerts.length}) ===`);

  for (const alert of allAlerts) {
    console.log(`[${alert.id}] ${alert.message}`);

    if (alert.error) {
      console.log(`  Error: ${alert.error.message}`);
    }
  }
}

// Subscribe to changes and update display
alerts.onChange(() => {
  displayAlerts();
});

// Trigger some alerts
alerts.set("warn-1", "Low memory");
alerts.set("error-1", "API timeout", new Error("Request timeout"));
```

### Temporary Alerts

```typescript
import { Alerts } from "@dynamic-mock-server/alerts";

const alerts = new Alerts();

// Set temporary alert
alerts.set("loading", "Loading configuration...");

setTimeout(() => {
  // Clear after operation completes
  alerts.remove("loading");
}, 2000);
```

## Dependencies

- `@dynamic-mock-server/mocks-manager` - Extends NestedRoutesSuites
- `types-guards` - Type checking utilities

## Related Packages

- [@dynamic-mock-server/core](../core) - Uses alerts for system notifications
- [@dynamic-mock-server/mocks-manager](../mocks-manager) - Uses alerts for file loading errors
- [@dynamic-mock-server/logger](../logger) - Complementary logging system

## License

Apache-2.0 © Miguel Martínez
