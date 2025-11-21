# @dynamic-mock-server/cli

Interactive command-line interface for Dynamic Mock Server. Provides an intuitive way to manage your mock server, change routes suites, override responses, and control server behavior in real-time.

## Features

## Features

- 🎯 **Interactive Mode**: Navigate options with an intuitive interface
- 🔁 **Hot Reload**: Change routes suites and responses without restarting
- 🎨 **Colored Output**: Beautiful terminal UI with picocolors
- ⚙️ **Flexible Commands**: CLI and programmatic API
- 📊 **Real-time Management**: Monitor and control your mock server on the fly
- 🚀 **Easy to Use**: Simple commands with helpful prompts

## Installation

```bash
pnpm add @dynamic-mock-server/cli
```

Or install globally:

```bash
pnpm add -g @dynamic-mock-server/cli
```

## Usage

### Binary Commands

#### Start Server (Interactive Mode)

By default, the `start` command launches an interactive interface:

```bash
dynamic-mock-server start
```

Options:

- `-p, --port <port>` - Server port (default: 3000)
- `-h, --host <host>` - Server host (default: 127.0.0.1)
- `--no-interactive` - Disable interactive mode and just run the server

Example with custom port:

```bash
dynamic-mock-server start --port 4000
```

Example in non-interactive mode:

```bash
dynamic-mock-server start --no-interactive
```

#### Show Server Status

Display current server information:

```bash
dynamic-mock-server status
```

Shows:

- Server running status
- Server URL
- Active routes suite
- Total routes, responses, and suites
- Any active alerts

#### Manage Routes Suites

List all available suites:

```bash
dynamic-mock-server suites list
```

Set active suite:

```bash
dynamic-mock-server suites set <suiteId>
```

Clear active suite:

```bash
dynamic-mock-server suites clear
```

#### Manage Routes

List all available routes:

```bash
dynamic-mock-server routes list
```

Override a route response:

```bash
dynamic-mock-server routes set <routeId> <responseId>
```

Clear a route response override:

```bash
dynamic-mock-server routes clear <routeId>
```

#### Restart Server

Restart the mock server:

```bash
dynamic-mock-server restart
```

### Programmatic Usage

```typescript
import { CLI, Commander, InteractiveCLI } from "@dynamic-mock-server/cli";
import { Core } from "@dynamic-mock-server/core";

// Create core instance
const core = new Core();

// Option 1: Use Commander for command-line interface
const commander = new Commander(core);
await commander.parse(process.argv);

// Option 2: Use CLI directly
const cli = new CLI({ core });
await cli.start();

// Get server status
const status = await cli.getStatus();
console.log(status);

// Change active suite
await cli.changeSuite("happy-path");

// Override route response
await cli.setRouteResponse("get-users", "error");

// Option 3: Use Interactive CLI
const interactive = new InteractiveCLI(core, cli);
await interactive.start();
```

## Interactive Mode

When you run `dynamic-mock-server start` without `--no-interactive`, you'll enter an interactive menu where you can:

- **[i] Show server status** - View current server state and statistics
- **[*] Change routes suite** - Select a different routes suite to activate
- **[>] View routes** - See all available routes with their responses
- **[~] Override route response** - Change a specific route's response
- **[R] Restart server** - Restart the mock server
- **[!] View alerts** - See any warnings or errors
- **[x] Exit** - Close the interactive interface

## API Reference

### CLI

Main CLI class for server management.

#### Constructor

```typescript
new CLI(options: CLIOptions)
```

Options:

- `core: Core` - Core instance (required)

#### Methods

- `start(): Promise<void>` - Initialize the CLI
- `stop(): Promise<void>` - Stop the CLI and cleanup
- `getStatus(): Promise<ServerStatus>` - Get server status information
- `showStatus(): Promise<void>` - Display server status in console
- `listSuites(): Promise<void>` - Display available suites
- `listRoutes(): Promise<void>` - Display available routes
- `changeSuite(suiteId: string | null): Promise<void>` - Change active suite
- `setRouteResponse(routeId: string, responseId: string | null): Promise<void>` - Override route response
- `restartServer(): Promise<void>` - Restart the server

### Commander

Commander.js integration for CLI commands.

#### Constructor

```typescript
new Commander(core?: Core)
```

#### Properties

- `program: Command` - Commander program instance
- `core: Core` - Core instance
- `cli: CLI` - CLI instance

#### Methods

- `parse(argv?: string[]): Promise<void>` - Parse command-line arguments

### InteractiveCLI

Interactive interface using @clack/prompts.

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

MIT
