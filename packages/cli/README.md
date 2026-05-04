# @dynamic-mock-server/cli

> Interactive and command-line interface for the Dynamic Mock Server

Intuitive CLI for managing your mock server in real-time. Features both an interactive mode powered by @clack/prompts and a command mode powered by Commander.js for scriptable automation.

## Features

- 🎨 **Interactive Mode**: Beautiful UI with @clack/prompts for navigation
- ⚙️ **Command Mode**: Scriptable CLI powered by Commander.js
- 🔄 **Hot Management**: Change suites and responses without restart
- 📊 **Real-time Status**: View server stats, routes, and configuration
- 🎯 **Suite Control**: Switch between route suites on the fly
- 🔧 **Route Overrides**: Override individual route responses
- 💻 **Programmatic API**: Use CLI classes in your own code
- 🌈 **Colored Output**: Clear, colorful terminal UI with picocolors

## Installation

```bash
pnpm add @dynamic-mock-server/cli
```

For global installation:

```bash
pnpm add -g @dynamic-mock-server/cli
```

## Quick Start

### Interactive Mode

Launch the beautiful interactive interface:

```bash
dynamic-mock-server interactive
# or shorthand
dynamic-mock-server i
```

Features:

- Arrow key navigation
- Real-time status display
- View configuration
- Change active suite
- List and manage routes
- Override route responses
- Restart server
- View alerts
- Graceful exit

### Command Mode

Use commands for scriptable automation:

```bash
# Start server
dynamic-mock-server start

# View status
dynamic-mock-server status

# Suite management
dynamic-mock-server suites list
dynamic-mock-server suites set happy-path
dynamic-mock-server suites clear

# Route management
dynamic-mock-server routes list
dynamic-mock-server routes set get-users error
dynamic-mock-server routes clear get-users

# Server control
dynamic-mock-server restart
dynamic-mock-server stop
```

## CLI Commands

### Server Management

#### `start`

Start the mock server.

```bash
dynamic-mock-server start
```

**Options:**

- `-p, --port <number>` - Server port (overrides config)
- `-h, --host <string>` - Server host (overrides config)
- `--no-interactive` - Disable interactive mode (show logs)

**Examples:**

```bash
dynamic-mock-server start
dynamic-mock-server start -p 8080
dynamic-mock-server start -h 0.0.0.0
dynamic-mock-server start --no-interactive
```

> **Note:** Interactive mode disables server logs for clean UI. Use `--no-interactive` to see full logs.

#### `status`

Display current server information.

```bash
dynamic-mock-server status
```

**Displays:**

- Running status
- Server URL
- Active suite
- Total routes, responses, and suites
- Active alerts

#### `restart`

Restart the server.

```bash
dynamic-mock-server restart
```

#### `stop`

Stop the server gracefully.

```bash
dynamic-mock-server stop
```

### Interactive Mode

#### `interactive` or `i`

Enter interactive mode for real-time management.

```bash
dynamic-mock-server interactive
# or
dynamic-mock-server i
```

### Routes Suites

#### `suites list`

List all available routes suites.

```bash
dynamic-mock-server suites list
```

#### `suites set <suiteId>`

Set the active routes suite.

```bash
dynamic-mock-server suites set happy-path
dynamic-mock-server suites set error-scenarios
```

#### `suites clear`

Clear the active suite (no default responses).

```bash
dynamic-mock-server suites clear
```

### Routes

#### `routes list`

List all available routes with their responses.

```bash
dynamic-mock-server routes list
```

#### `routes set <routeId> <responseId>`

Override a specific route's response.

```bash
dynamic-mock-server routes set get-users error
dynamic-mock-server routes set get-products empty
```

#### `routes clear <routeId>`

Clear a route override (revert to suite default).

```bash
dynamic-mock-server routes clear get-users
```

## Programmatic Usage

Use CLI classes in your own application:

```typescript
import { CLI, InteractiveCLI } from "@dynamic-mock-server/cli";
import { Core } from "@dynamic-mock-server/core";

// Create core instance
const core = new Core();

// Option 1: Use CLI class programmatically
const cli = new CLI({ core });

// Start server
await cli.start();

// Change active suite
await cli.changeSuite("happy-path");

// Override route response
await cli.setRouteResponse("get-users", "error");

// Restart server
await cli.restartServer();

// Option 2: Use Interactive CLI
const interactiveCLI = new InteractiveCLI(core);
await interactiveCLI.start();
```

## Interactive Mode Features

When using `dynamic-mock-server interactive`, you get:

### Main Menu Options

- 📊 **Show server status** - Display server URL, active suite, route counts
- 🔧 **View configuration** - See current config settings
- 🗂️ **Change routes suite** - Select from available suites
- 📝 **View routes** - List all routes with methods and URLs
- 🎯 **Override route response** - Set specific route responses
- 🔄 **Restart server** - Restart without losing context
- ⚠️ **View alerts** - Check for warnings or errors
- 🚪 **Exit** - Gracefully exit the CLI

### Interactive Navigation

- Arrow keys to navigate options
- Enter/Return to select
- Ctrl+C or ESC to go back or cancel
- Clean, colorful output with visual feedback

## API Reference

### CLI Class

Base CLI class for programmatic server management.

#### Constructor

```typescript
constructor(options: CLIOptions)
```

**CLIOptions:**

- `core: Core` - Core instance to manage

#### Methods

##### `async start(): Promise<void>`

Start the server.

```typescript
await cli.start();
```

##### `async changeSuite(suiteId: string | null): Promise<void>`

Change the active routes suite.

```typescript
await cli.changeSuite("happy-path");
await cli.changeSuite(null); // Clear suite
```

##### `async setRouteResponse(routeId: string, responseId: string | null): Promise<void>`

Override a specific route's response.

```typescript
await cli.setRouteResponse("get-users", "error");
await cli.setRouteResponse("get-users", null); // Clear override
```

##### `async restartServer(): Promise<void>`

Restart the mock server.

```typescript
await cli.restartServer();
```

### InteractiveCLI Class

Interactive CLI with @clack/prompts UI. Extends CLI class.

#### Constructor

```typescript
constructor(core: Core)
```

**Parameters:**

- `core: Core` - Core instance to manage

#### Methods

##### `async start(): Promise<void>`

Start interactive mode with menu navigation.

```typescript
const interactiveCLI = new InteractiveCLI(core);
await interactiveCLI.start();
```

##### `async stop(): Promise<void>`

Stop interactive mode.

```typescript
await interactiveCLI.stop();
```

## Examples

### Basic CLI Usage

```typescript
import { Core } from "@dynamic-mock-server/core";
import { CLI } from "@dynamic-mock-server/cli";

const core = new Core();
const cli = new CLI({ core });

// Start server
await cli.start();

// Show status
console.log("Server running!");

// Change suite after 5 seconds
setTimeout(async () => {
  await cli.changeSuite("error-scenarios");
  console.log("Switched to error scenarios");
}, 5000);
```

### Interactive CLI

```typescript
import { Core } from "@dynamic-mock-server/core";
import { InteractiveCLI } from "@dynamic-mock-server/cli";

const core = new Core();
const interactiveCLI = new InteractiveCLI(core);

// Start interactive mode
await interactiveCLI.start();
// User can now navigate with arrow keys and manage server
```

### Custom CLI Tool

```typescript
#!/usr/bin/env node
import { Core } from "@dynamic-mock-server/core";
import { CLI } from "@dynamic-mock-server/cli";

const core = new Core();
const cli = new CLI({ core });

// Your custom logic
const args = process.argv.slice(2);

if (args[0] === "demo") {
  // Add demo routes
  core.mocksManager.addRoute({
    id: "demo",
    url: "/demo",
    method: "GET",
    responses: [{ id: "ok", status: 200, body: { demo: true } }],
  });
}

await cli.start();
console.log("Demo server started!");
```

## Dependencies

- `@dynamic-mock-server/core` - Core server functionality
- `@clack/prompts` - Interactive prompts for beautiful CLI
- `commander` - Command-line argument parsing
- `picocolors` - Terminal coloring

## Related Packages

- [@dynamic-mock-server/core](../core) - Core server that CLI manages
- [@dynamic-mock-server/config](../config) - Configuration system
- [@dynamic-mock-server/mocks-manager](../mocks-manager) - Mock management

## License

Apache-2.0 © Miguel Martínez

#### Constructor

```typescript
new InteractiveCLI(core: Core, cli: CLI)
```

#### Methods

- `start(): Promise<void>` - Start interactive mode
- `stop(): Promise<void>` - Stop interactive mode

## Examples

### Change Suite and Override Response

```typescript
import { CLI } from "@dynamic-mock-server/cli";
import { Core } from "@dynamic-mock-server/core";

const core = new Core();
const cli = new CLI({ core });

await core.start();

// Change to error scenarios suite
await cli.changeSuite("error-scenarios");

// But use success response for a specific route
await cli.setRouteResponse("get-user-profile", "success");
```

### Custom Command Integration

```typescript
import { Commander } from "@dynamic-mock-server/cli";

const commander = new Commander();

// Add custom command
commander.program
  .command("custom")
  .description("Custom command")
  .action(async () => {
    console.log("Custom action");
  });

await commander.parse(process.argv);
```

## Configuration

The CLI respects the server configuration file (`dynamicMockServer.config.{js,json,yaml}`). See [@dynamic-mock-server/config](../config/README.md) for details.

## Dependencies

- `commander` - CLI framework
- `@clack/prompts` - Interactive prompts
- `picocolors` - Terminal colors
- `@dynamic-mock-server/core` - Server core functionality

## License

Apache-2.0 © Miguel Martínez
