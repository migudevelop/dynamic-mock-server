import { Server } from "./server";
import { Config } from "@dynamic-mock-server/config";

export class Core {
  private _server: Server;
  // private _routesHandler: RoutesHandler;
  private _config: Config;

  constructor() {
    this._config = new Config();
    // this._routesHandler = new RoutesHandler();
    this._server = new Server({ config: this._config });
  }

  async start() {
    await this._config.getConfig();
    await this._server.start();
  }
}
