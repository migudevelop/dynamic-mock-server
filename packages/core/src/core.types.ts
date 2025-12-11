import type { ConfigType } from "@dynamic-mock-server/config";
import type { Logger } from "@dynamic-mock-server/logger";
import type { PluginConstructor } from "./plugins-manager.types.js";

/**
 * Options for Core initialization
 */
export interface CoreOptions {
  /** Configuration overrides */
  config?: Partial<ConfigType>;
  /** Array of plugins to register */
  plugins?: {
    register?: PluginConstructor[];
  };
  /** Logger instance to use, or false to disable logging */
  logger?: Logger | false;
}
