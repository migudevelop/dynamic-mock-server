# App Store

Global state management for the Dynamic Mock Server desktop application using Zustand.

> **Note**: This store runs in the browser (React frontend). Core and Config instances run in the Tauri backend. See [TAURI_ARCHITECTURE.md](../../TAURI_ARCHITECTURE.md) for details on the client-server architecture.

## Features

- **Persistent Storage**: Project path is saved in localStorage and automatically restored on app restart
- **Type-Safe**: Full TypeScript support with proper typing
- **Tauri-Compatible**: Designed to work with Tauri's IPC architecture

## State Structure

```typescript
interface AppState {
  projectPath: string | null; // Selected project folder path
  config: ConfigType | null; // Loaded configuration (JSON data only)
  isLoading: boolean; // Loading state
  error: string | null; // Error message if any
}
```

**Important**: `Core` and `Config` instances are NOT stored here. They run in the Tauri backend (Rust/Node.js side) and are accessed via Tauri commands.

## Actions

### `setProjectPath(path: string | null)`

Sets the project path and persists it to localStorage.

> **TODO**: Currently this only stores the path. It needs to be integrated with Tauri commands to actually load the configuration and initialize the backend Core instance.

```typescript
const setProjectPath = useAppStore((state) => state.setProjectPath);

// Set a new project path
await setProjectPath("/path/to/project");

// Clear the project path
await setProjectPath(null);
```

### `reloadConfig()`

Reloads the configuration from the current project path. Useful when the configuration file changes.

````typescript
const reloadConfig = useAppStore((state) => state.reload

> **TODO**: Needs to be integrated with Tauri commands to reload configuration from the backend.

```typescript
const reloadConfig = useAppStore((state) => state.reloadConfig);

await reloadConfig();
````

### `clearState()`

Clears all state.

> **TODO**: Should also call Tauri command to stop the backend server

clearState();

````

## Usage Examples

### Basic Usage

```typescript
import { useAppStore } from "@/stores";

  return (
    <div>
      <p>Project: {projectPath || "Not set"}</p>
      <p>Config: {config ? "Loaded" : "Not loaded"}</p>
    </div>
  );
}
````

### Access Multiple Values

```typescript
const { projectPath, config, isLoading } = useAppStore((state) => ({
  projectPath: state.projectPath,
  config: state.config,
  isLoading: state.isLoading,
}));
```

### Working with the Server (via Tauri Commands)

> **TODO**: These Tauri commands need to be implemented in the Rust backend first.

```typescript
import { invoke } from "@tauri-apps/api/core";

// Start the server
await invoke("start_server");

// Stop the server
await invoke("stop_server");

// Load configuration
const config = await invoke<ConfigType>("load_config", { path: projectPath });
// Access config from Core
if (core) {
  const config = core.config.getConfig();
}
```

### React to Changes

```typescript
useEffect(() => {
  if (projectPath) {
    console.log("Project path changed:", projectPath);
    // Do something when the project path changes
  }
}, [projectPath]);
```

## How It Works

### Initial Load

When the app starts:

1. Zustand loads the persisted state from localStorage
2. If a `projectPath` exists, it automatically recreates the Config and Core instances
3. The app is ready to use with the last selected project

### Current Implementation

1. **Project Path Storage**: When a folder is selected, the path is saved to localStorage
2. **Data Only**: The store only holds JSON data (path, config), not object instances
3. **Tauri Integration (TODO)**: Server control will be done via Tauri commands to the backend

### Future Implementation

When Tauri commands are added:

1. **Select Folder** → Store saves path to localStorage → Tauri command loads config from backend
2. **Start Server** → Tauri command starts Core instance in backend → Frontend receives status updates
3. **Stop Server** → Tauri command stops Core instance → Frontend updates UI

- `dynamicMockServer.config.js`
- `dynamicMockServer.config.ts`
- `dynamicMockServer.config.cjs`

If no configuration file is found, default values are used.

## Tauri Compatibility

This store is fully compatible with Tauri applications:

- Uses `localStorage` for persistence (available in Tauri's webview)
- Only stores JSON-serializable data (no object instances)
- Designed to communicate with Tauri backend via IPC commands

## Architecture

```Only store serializable data**: Don't try to store class instances or functions
2. **Use Tauri commands for backend operations**: Server start/stop, file operations, etc.
3. **Handle errors gracefully**: Use try/catch when calling async actions and Tauri commands
4. **Show loading states**: Use `isLoading` to disable UI during operation
│  - UI Components                │
│  - Tauri invoke() calls         │
└─────────────┬───────────────────┘
              │ IPC
┌─────────────▼───────────────────┐
│  Backend (Tauri/Rust/Node.js)   │
│  - Core instance                │
│  - Config instance              │
│  - File system access           │
│  - Server lifecycle             │
└─────────────────────────────────┘
```

See [TAURI_ARCHITECTURE.md](../../TAURI_ARCHITECTURE.md) for more details.

## Best Practices

1. **Always check for null**: Core and Config can be null if no project is selected
2. **Handle errors**: Use try/catch when calling async actions
3. TAURI_ARCHITECTURE.md](../../TAURI_ARCHITECTURE.md) - Architecture and integration guide

- [app-store.examples.tsx](./app-store.examples.tsx) - Usage examples
- [config.types.ts](../types/config.types.ts) - Configuration type definitionsders

## Error Handling

Errors are captured in the `error` state:

```typescript
const error = useAppStore((state) => state.error);

useEffect(() => {
  if (error) {
    // Show error to user
    console.error("App error:", error);
  }
}, [error]);
```

## See Also

- [app-store.examples.tsx](./app-store.examples.tsx) - More usage examples
- [@dynamic-mock-server/config](../../../packages/config/README.md) - Config package documentation
- [@dynamic-mock-server/core](../../../packages/core/README.md) - Core package documentation
