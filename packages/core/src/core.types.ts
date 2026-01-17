import type { Config } from "@dynamic-mock-server/config";
import type { Logger } from "@dynamic-mock-server/logger";
import type { PluginConstructor } from "./plugins-manager.types.js";

/**
 * Options for Core initialization
 */
export interface CoreOptions {
  /** Configuration overrides */
  config?: Config;
  /** Array of plugins to register */
  plugins?: {
    register?: PluginConstructor[];
  };
  /** Logger instance to use, or false to disable logging */
  logger?: Logger | false;
}
