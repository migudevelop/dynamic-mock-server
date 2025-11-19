import type { Plugin, CoreApi } from "../plugins.types";

/**
 * Example plugin demonstrating the plugin system
 */
export class ExamplePlugin implements Plugin {
  static readonly id = "examplePlugin";

  private _logger: any;

  constructor(coreApi: CoreApi) {
    this._logger = coreApi.logger;
  }

  register(coreApi: CoreApi): void {
    this._logger.info(`[${ExamplePlugin.id}] Registering plugin...`);
  }

  async init(): Promise<void> {
    this._logger.info(`[${ExamplePlugin.id}] Initializing plugin...`);
  }

  async start(): Promise<void> {
    this._logger.info(`[${ExamplePlugin.id}] Starting plugin...`);
  }

  async stop(): Promise<void> {
    this._logger.info(`[${ExamplePlugin.id}] Stopping plugin...`);
  }
}
