# Dynamic Mock Server — Desktop App

> Cross-platform GUI for managing the Dynamic Mock Server, built with Tauri v2 and React 19.

The Desktop App provides a visual interface for managing mock server projects without needing to use the CLI directly. It allows developers to start and stop the server, manage routes and suites, monitor logs in real time, and edit configuration files — all from a native desktop window.

## Features

- 🖥️ **Native Desktop App**: Cross-platform (Windows, macOS, Linux) via Tauri v2
- 🚀 **Project Management**: Save and switch between multiple mock server projects
- ▶️ **Server Control**: Start and stop the server with one click
- 📡 **Real-time Status**: Polling every 5 seconds to display server state, active suite, and route stats
- 📋 **Route & Suite Management**: View, add, edit, and delete routes and responses
- 🗂️ **Suite Switching**: Change the active routes suite on the fly
- 🎯 **Response Overrides**: Override individual route responses independently of the active suite
- 📜 **Live Logs**: Stream server logs in real time directly in the UI
- ✏️ **Config Editor**: Edit mock configuration files with Monaco Editor
- 🌙 **Dark / Light Mode**: Theme support via shadcn/ui

## Tech Stack

| Layer            | Technology                                      |
| ---------------- | ----------------------------------------------- |
| Desktop shell    | Tauri v2 (Rust + WebView)                       |
| Frontend         | React 19 + TypeScript                           |
| Routing          | React Router v7                                 |
| Styling          | Tailwind CSS v4 + shadcn/ui                     |
| State            | Zustand v5 (projects persisted in localStorage) |
| Forms            | React Hook Form v7 + Zod v4                     |
| Code editor      | Monaco Editor                                   |
| Notifications    | Sonner                                          |
| Build (frontend) | Vite 7                                          |

## Architecture

The desktop app does **not** embed the mock server directly. Instead, the Rust backend spawns the `dynamic-mock-server` CLI as a child process and communicates with it through Tauri IPC commands:

```
Frontend (React/WebView)
       │
       │  invoke / emit (Tauri IPC)
       ▼
Backend (Rust + Tauri)
       │
       │  child process (Node.js)
       ▼
dynamic-mock-server CLI  →  Fastify server on localhost:3000
```

The frontend communicates with the running server via the Admin REST API (`/__admin/*`) proxied through a Tauri command.

### Tauri Commands

| Command                                  | Description                             |
| ---------------------------------------- | --------------------------------------- |
| `start_server(path, host?, port?)`       | Spawns the CLI as a child process       |
| `stop_server()`                          | Stops the running server                |
| `server_status()`                        | Returns current server state            |
| `get_server_logs()`                      | Returns buffered log entries            |
| `admin_request({ method, path, body })`  | Proxies requests to `/__admin/*`        |
| `detect_cli(path)`                       | Checks if CLI is installed in a project |
| `read_config(path)`                      | Reads the project config file           |
| `read_file_content / write_file_content` | File system operations                  |
| `list_directory / delete_file`           | Directory operations                    |

## Requirements

### For end users (running the app)

- Windows 10+, macOS 10.15+, or a modern Linux distribution with WebKit2GTK
- `dynamic-mock-server` CLI installed in each project you want to manage (`pnpm add -D @dynamic-mock-server/cli`)

### For development

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) >= 9
- [Rust](https://www.rust-lang.org/tools/install) stable toolchain
- **Linux only**: `libwebkit2gtk-4.1-dev`, `libappindicator3-dev`, `librsvg2-dev`, `patchelf`

## Development Setup

```bash
# Install all monorepo dependencies from the repo root
pnpm install

# Start the desktop app in development mode (from repo root)
pnpm dev

# Or start directly from apps/desktop
cd apps/desktop
pnpm tauri dev
```

The Vite dev server runs on `http://localhost:1420`.

## Building for Distribution

```bash
# From repo root (builds all packages first, then the app)
pnpm build

# Or directly from apps/desktop
cd apps/desktop
pnpm tauri build
```

Artifacts are generated in `apps/desktop/src-tauri/target/release/bundle/`.

## Release

Releases are automated via GitHub Actions (`.github/workflows/desktop-app-release.yml`). The workflow builds the app for Windows, macOS, and Ubuntu and publishes a GitHub Release with all platform bundles.

To trigger a release, run the workflow manually and optionally provide a version number override. If left empty, it uses the version from `apps/desktop/package.json`.

## License

Apache-2.0 © Miguel Martínez
