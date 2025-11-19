# @dynamic-mock-server/alerts

Alert management system with namespace support for organizing warnings and errors.

## Features

- Hierarchical alert organization by namespace
- Structured error details capture
- Change notification system
- Flat access to all alerts across namespaces

## Usage

```typescript
import { Alerts } from "@dynamic-mock-server/alerts";

const alerts = new Alerts();

// Set a simple alert
alerts.set("warning-1", "Configuration file not found");

// Set an alert with error details
try {
  throw new Error("Connection failed");
} catch (error) {
  alerts.set("error-1", "Failed to connect to database", error);
}

// Create namespaced alerts
const routeAlerts = alerts.collection("routes");
routeAlerts.set("route-error", "Route '/api/users' not found");

// Get all alerts (including namespaced ones)
const allAlerts = alerts.flat;
console.log(allAlerts); // [{ id, message, error? }, ...]

// Subscribe to changes
const unsubscribe = alerts.onChange(() => {
  console.log("Alerts updated");
});

// Remove an alert
alerts.remove("warning-1");

// Clean all alerts
alerts.clean();
```
