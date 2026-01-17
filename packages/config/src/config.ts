import { cosmiconfigSync } from "cosmiconfig";
import merge from "deepmerge";

import type { ConfigType } from "./config.types.js";
import {
  DEFAULT_CONFIG,
  DEFAULT_SEARCH_PLACES,
  FILE_NAME,
} from "./constants.js";

export class Config {
  private _config: ConfigType | null = null;
  private _rootDir: string | undefined = undefined;

  constructor(rootDir?: string) {
    this._rootDir = rootDir ?? process.cwd();
  }

  loadConfig(): ConfigType {
    const explorer = cosmiconfigSync(FILE_NAME, {
      searchPlaces: DEFAULT_SEARCH_PLACES,
      stopDir: this._rootDir,
    });
    const result = explorer.search();
    if (!result || result.isEmpty) {
      // Return a deep copy to prevent external mutations
      return merge({}, DEFAULT_CONFIG) as ConfigType;
    }
    // Merge defaults with loaded config (user config takes precedence)
    return merge(DEFAULT_CONFIG, result.config) as ConfigType;
  }

  getConfig(): ConfigType {
    if (this._config) {
      // Return a deep copy to prevent external mutations from affecting the cache
      return merge({}, this._config) as ConfigType;
    }
    this._config = this.loadConfig();
    // Return a deep copy to prevent external mutations from affecting the cache
    return merge({}, this._config) as ConfigType;
  }
}
