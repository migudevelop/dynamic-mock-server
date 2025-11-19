import type { CoreApi } from "../plugins-manager.types";
import { FilesLoader } from "../files/files-loader";

/**
 * Example plugin that demonstrates file loading with hot-reload.
 * This plugin initializes the FilesLoader to load routes and routes suites from files
 * and automatically reloads them when files change.
 */
export class FileLoaderPlugin {
  static readonly id = "file-loader";

  private _coreApi: CoreApi;
  private _filesLoader?: FilesLoader;

  constructor(coreApi: CoreApi) {
    this._coreApi = coreApi;
  }

  /**
   * Register plugin during registration phase
   */
  async register(): Promise<void> {
    const logger = this._coreApi.logger.namespace("file-loader-plugin");
    logger.info("Registering file loader plugin");

    // Initialize FilesLoader
    this._filesLoader = new FilesLoader({
      config: this._coreApi.config,
      logger: this._coreApi.logger,
      alerts: this._coreApi.alerts,
      mocksManager: this._coreApi.mocksManager,
    });
  }

  /**
   * Initialize plugin
   */
  async init(): Promise<void> {
    if (!this._filesLoader) {
      return;
    }

    const logger = this._coreApi.logger.namespace("file-loader-plugin");
    logger.info("Initializing file loader");

    await this._filesLoader.init();
  }

  /**
   * Start plugin and begin watching files
   */
  async start(): Promise<void> {
    if (!this._filesLoader) {
      return;
    }

    const logger = this._coreApi.logger.namespace("file-loader-plugin");
    logger.info("Starting file loader");

    await this._filesLoader.start();
  }

  /**
   * Stop plugin and stop watching files
   */
  async stop(): Promise<void> {
    if (!this._filesLoader) {
      return;
    }

    const logger = this._coreApi.logger.namespace("file-loader-plugin");
    logger.info("Stopping file loader");

    await this._filesLoader.stop();
  }
}

export default FileLoaderPlugin;
