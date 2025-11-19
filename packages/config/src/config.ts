import { cosmiconfigSync } from "cosmiconfig";

import type { ConfigType } from "./config.types";
import { DEFAULT_CONFIG, DEFAULT_SEARCH_PLACES, FILE_NAME } from "./constants";

export class Config {
  private _config: ConfigType | null = null;

  async loadConfig(): Promise<ConfigType> {
    const explorer = cosmiconfigSync(FILE_NAME, {
      searchPlaces: DEFAULT_SEARCH_PLACES,
      stopDir: process.cwd(),
    });
    const result = explorer.search();
    if (!result || result.isEmpty) {
      return DEFAULT_CONFIG;
    }
    return result.config;
  }

  async getConfig(): Promise<ConfigType> {
    if (this._config) {
      return this._config;
    }
    this._config = await this.loadConfig();
    return this._config;
  }
}
