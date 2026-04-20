import type { Core } from "@dynamic-mock-server/core";
import pc from "picocolors";

import type { CLIOptions, ServerStatus } from "./cli.types.js";

/**
 * CLI class for managing the command-line interface
 */
export class CLI {
  protected _core: Core;

  constructor({ core }: CLIOptions) {
    this._core = core;
  }

  async start(): Promise<void> {
    await this._core.start();
  }

  /**
   * Get server status information
   */
  async getStatus(): Promise<ServerStatus> {
    const stats = this._core.mocksManager.getStats();
    const config = this._core.config.getConfig();
    const address = this._core.server.address();

    // Use server.address() if available (Server now normalizes loopback/bind-all).
    // Only normalize the fallback coming from config.server.host.
    let url: string | undefined;
    if (address) {
      url = address;
    } else if (config.server) {
      const rawHost = config.server.host ?? "localhost";
      const host = this._core.server.isLocalhost(rawHost.toLowerCase())
        ? "localhost"
        : rawHost;
      url = `http://${host}:${config.server.port}`;
    }

    return {
      running: address !== null,
      url,
      activeSuite: stats.activeSuite,
      totalRoutes: stats.totalRoutes,
      totalResponses: stats.totalResponses,
      totalSuites: stats.totalSuites,
    };
  }

  /**
   * Change the active routes suite
   */
  async changeSuite(suiteId: string | null): Promise<void> {
    this._core.mocksManager.setActiveSuite(suiteId);
    const message = suiteId
      ? `Active suite changed to: ${pc.green(suiteId)}`
      : "Active suite cleared";
    this._log(pc.green("✓ ") + message);
  }

  /**
   * Override a specific route response
   */
  async setRouteResponse(
    routeId: string,
    responseId: string | null,
  ): Promise<void> {
    this._core.mocksManager.setRouteResponse(routeId, responseId);
    const message = responseId
      ? `Route ${pc.cyan(routeId)} response set to: ${pc.green(responseId)}`
      : `Route ${pc.cyan(routeId)} response override cleared`;
    this._log(pc.green("✓ ") + message);
  }

  /**
   * Restart the mock server
   */
  async restartServer(): Promise<void> {
    this._log(pc.yellow("Restarting server..."));
    await this._core.stop();
    await this._core.start();
    this._log(pc.green("✓ Server restarted"));
  }

  /**
   * Log a message (respects color settings)
   */
  private _log(message: string): void {
    console.log(message);
  }
}
