import { Core } from "./core";

export { Core } from "./core";
export type { CoreOptions } from "./core.types";
export { Server } from "./server";
export { PluginManager } from "./plugins-manager";
export type {
  Plugin,
  PluginConstructor,
  PluginManagerOptions,
  CoreApi,
} from "./plugins-manager.types";

// Export admin routes
export { AdminRoutes } from "./routes/admin-routes";

// Main entry point for direct execution
export async function main(): Promise<Core> {
  const core = new Core();
  await core.start();
  return core;
}
