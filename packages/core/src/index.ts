import { Core } from "./core";

export { Core } from "./core";
export type { CoreOptions } from "./core";
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

// Export files system
export { FilesLoader } from "./files";
export type { FilesLoaderOptions } from "./files";
export type {
  RouteDefinition,
  RouteVariantDefinition,
  RoutesSuiteDefinition,
} from "./files";

// Main entry point for direct execution
export async function main(): Promise<Core> {
  const core = new Core();
  await core.start();
  return core;
}
