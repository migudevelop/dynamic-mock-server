import { Core } from "./core.js";

export { Core } from "./core.js";
export type { CoreOptions } from "./core.types.js";
export { Server } from "./server.js";
export { PluginManager } from "./plugins-manager.js";
export type {
  Plugin,
  PluginConstructor,
  PluginManagerOptions,
  CoreApi,
} from "./plugins-manager.types.js";

// Export admin routes
export { AdminRoutes } from "./routes/admin-routes.js";

// Main entry point for direct execution
export async function main(): Promise<Core> {
  const core = new Core();
  await core.start();
  return core;
}
