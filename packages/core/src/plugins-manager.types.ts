import type { Core } from "./core";
import type { MocksManager } from "@dynamic-mock-server/mocks-manager";
import type { Config } from "@dynamic-mock-server/config";
import type Logger from "@dynamic-mock-server/logger";
import type { Alerts } from "@dynamic-mock-server/alerts";
import type { Server } from "./server";

/**
 * Core API exposed to plugins
 */
export interface CoreApi {
  /** Configuration system */
  config: Config;
  /** Logger instance */
  logger: Logger;
  /** Alerts system */
  alerts: Alerts;
  /** Mock management */
  mocksManager: MocksManager;
  /** Server instance */
  server: Server | null;
  /** Core version */
  version: string;
}

/**
 * Plugin interface - plugins must implement static id and can implement lifecycle hooks
 */
export interface Plugin {
  /**
   * Called during plugin registration, before any initialization.
   * Use this to register response handlers, configure options, etc.
   */
  register?(coreApi: CoreApi): void;

  /**
   * Called during initialization phase.
   * Setup internal state, but don't start services yet.
   */
  init?(): void | Promise<void>;

  /**
   * Called when the core starts.
   * Start background services, servers, watchers, etc.
   */
  start?(): void | Promise<void>;

  /**
   * Called when the core stops.
   * Clean up resources, close connections, etc.
   */
  stop?(): void | Promise<void>;
}

/**
 * Plugin constructor (class)
 */
export interface PluginConstructor {
  /** Unique plugin ID */
  readonly id: string;

  /**
   * Constructor that receives the core API
   */
  new (coreApi: CoreApi, core?: Core): Plugin;
}

/**
 * Options for the plugin manager
 */
export interface PluginManagerOptions {
  /** Array of plugin constructors to register */
  register?: PluginConstructor[];
}
