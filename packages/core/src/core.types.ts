import type { ConfigType } from "@dynamic-mock-server/config";
import type { PluginConstructor } from "./plugins-manager.types";

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
}
