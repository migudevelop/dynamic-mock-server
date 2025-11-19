import type {
  Plugin,
  PluginConstructor,
  PluginManagerOptions,
  CoreApi,
} from "./plugins-manager.types";
import type { Core } from "./core";
import { isFunction, isString } from "@migudevelop/types-utils";

/**
 * PluginManager handles the lifecycle of all registered plugins.
 * It ensures plugins are initialized and started/stopped in the correct order.
 */
export class PluginManager {
  private _plugins: Plugin[] = [];
  private _pluginIds = new Set<string>();
  private _coreApi: CoreApi;
  private _core: Core;
  private _options?: PluginManagerOptions;

  constructor(coreApi: CoreApi, core: Core, options?: PluginManagerOptions) {
    this._coreApi = coreApi;
    this._core = core;
    this._options = options;
  }

  /**
   * Register an array of plugin constructors
   */
  register(plugins: PluginConstructor[]): void {
    for (const PluginClass of plugins) {
      this._registerPlugin(PluginClass);
    }
  }

  /**
   * Register a single plugin constructor
   */
  private _registerPlugin(PluginClass: PluginConstructor): void {
    // Validate plugin has an id
    if (!PluginClass.id || !isString(PluginClass.id)) {
      throw new Error(
        `Plugin ${PluginClass.name || "Unknown"} must have a static 'id' property`
      );
    }

    // Check for duplicate plugin IDs
    if (this._pluginIds.has(PluginClass.id)) {
      throw new Error(
        `Plugin with id "${PluginClass.id}" is already registered`
      );
    }

    // Instantiate the plugin
    const plugin = new PluginClass(this._coreApi, this._core);

    // Call register hook if it exists
    if (isFunction(plugin.register)) {
      plugin.register(this._coreApi);
    }

    // Store plugin
    this._plugins.push(plugin);
    this._pluginIds.add(PluginClass.id);
  }

  /**
   * Initialize all plugins (calls init() on each)
   */
  async init(): Promise<void> {
    // Load plugins from config
    const config = await this._coreApi.config.getConfig();
    const configPlugins = (config.plugins as { register?: PluginConstructor[] })
      ?.register;

    // Register plugins from config first
    if (configPlugins && Array.isArray(configPlugins)) {
      this.register(configPlugins);
    }

    // Then register plugins from options (allows overrides)
    if (this._options?.register && Array.isArray(this._options.register)) {
      this.register(this._options.register);
    }

    // Initialize all registered plugins
    for (const plugin of this._plugins) {
      if (isFunction(plugin.init)) {
        await plugin.init();
      }
    }
  }

  /**
   * Start all plugins (calls start() on each)
   */
  async start(): Promise<void> {
    for (const plugin of this._plugins) {
      if (isFunction(plugin.start)) {
        await plugin.start();
      }
    }
  }

  /**
   * Stop all plugins in reverse order (calls stop() on each)
   */
  async stop(): Promise<void> {
    // Stop in reverse order
    for (let i = this._plugins.length - 1; i >= 0; i--) {
      const plugin = this._plugins[i];
      if (plugin && isFunction(plugin.stop)) {
        await plugin.stop();
      }
    }
  }

  /**
   * Get all registered plugin IDs
   */
  get pluginIds(): string[] {
    return Array.from(this._pluginIds);
  }

  /**
   * Get number of registered plugins
   */
  get count(): number {
    return this._plugins.length;
  }
}

export default PluginManager;
