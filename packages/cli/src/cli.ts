import pc from "picocolors";
import type { Core } from "@dynamic-mock-server/core";
import type { CLIOptions, ServerStatus } from "./cli.types.js";

/**
 * CLI class for managing the interactive command-line interface
 */
export class CLI {
  private _core: Core;
  private _enabled: boolean;
  private _colors: boolean;
  private _started = false;

  constructor(options: CLIOptions) {
    this._core = options.core;
    this._enabled = options.enabled ?? true;
    this._colors = options.colors ?? true;
  }

  /**
   * Check if CLI is enabled
   */
  get enabled(): boolean {
    return this._enabled;
  }

  /**
   * Set CLI enabled state
   */
  set enabled(value: boolean) {
    this._enabled = value;
  }

  /**
   * Check if CLI has been started
   */
  get started(): boolean {
    return this._started;
  }

  /**
   * Start the CLI
   */
  async start(): Promise<void> {
    if (!this._enabled || this._started) {
      return;
    }
    this._started = true;
    this._log(pc.green("✓ CLI started"));
  }

  /**
   * Stop the CLI
   */
  async stop(): Promise<void> {
    if (!this._started) {
      return;
    }
    this._started = false;
    this._log(pc.yellow("CLI stopped"));
  }

  /**
   * Get server status information
   */
  async getStatus(): Promise<ServerStatus> {
    const stats = this._core.mocksManager.getStats();
    const config = this._core.config.getConfig();
    const address = this._core.server.address();

    // Format URL correctly (replace ::1 with localhost)
    let url: string | undefined;
    if (address) {
      url = address.replace("::1", "localhost").replace("0.0.0.0", "localhost");
    } else if (config.server) {
      // Fallback to config
      const host =
        config.server.host === "0.0.0.0" || config.server.host === "::1"
          ? "localhost"
          : config.server.host;
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
   * Display server status
   */
  async showStatus(): Promise<void> {
    const status = await this.getStatus();

    console.log("\n" + pc.bold(pc.cyan("=== Server Status ===")));
    console.log(
      `${pc.bold("Status:")} ${status.running ? pc.green("Running") : pc.red("Stopped")}`
    );

    if (status.url) {
      console.log(`${pc.bold("URL:")} ${pc.blue(status.url)}`);
    }

    console.log(
      `${pc.bold("Active Suite:")} ${status.activeSuite ? pc.green(status.activeSuite) : pc.yellow("None")}`
    );
    console.log(
      `${pc.bold("Routes:")} ${pc.cyan(status.totalRoutes.toString())}`
    );
    console.log(
      `${pc.bold("Responses:")} ${pc.cyan(status.totalResponses.toString())}`
    );
    console.log(
      `${pc.bold("Suites:")} ${pc.cyan(status.totalSuites.toString())}`
    );
    console.log();
  }

  /**
   * List all available routes suites
   */
  async listSuites(): Promise<void> {
    const suites = this._core.mocksManager.getSuites();
    const activeSuite = this._core.mocksManager.getActiveSuite();

    console.log("\n" + pc.bold(pc.cyan("=== Routes Suites ===")));

    if (suites.length === 0) {
      console.log(pc.yellow("No suites available"));
      console.log();
      return;
    }

    for (const suite of suites) {
      const isActive = suite.id === activeSuite;
      const prefix = isActive ? pc.green("●") : pc.gray("○");
      const name = isActive ? pc.green(pc.bold(suite.id)) : suite.id;
      const routeCount = Object.keys(suite.routes).length;

      console.log(`${prefix} ${name} ${pc.gray(`(${routeCount} routes)`)}`);
    }

    console.log();
  }

  /**
   * List all available routes
   */
  async listRoutes(): Promise<void> {
    const routes = this._core.mocksManager.getRoutes();

    console.log("\n" + pc.bold(pc.cyan("=== Routes ===")));

    if (routes.length === 0) {
      console.log(pc.yellow("No routes available"));
      console.log();
      return;
    }

    for (const route of routes) {
      const method = this._colorMethod(route.method);
      const url = pc.blue(route.url);
      const responseCount = route.responses.length;

      console.log(
        `${method} ${url} ${pc.gray(`(${responseCount} responses)`)}`
      );

      // Show active response
      const activeResponse = this._core.mocksManager.resolveResponse(route.id);
      if (activeResponse) {
        console.log(`  ${pc.green("→")} ${pc.gray(activeResponse.id)}`);
      }
    }

    console.log();
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
    responseId: string | null
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
   * Display a header with optional stats
   */
  displayHeader(): void {
    console.clear();
    console.log(pc.bold(pc.cyan("╔════════════════════════════════════════╗")));
    console.log(pc.bold(pc.cyan("║   Dynamic Mock Server - CLI            ║")));
    console.log(pc.bold(pc.cyan("╚════════════════════════════════════════╝")));
    console.log();
  }

  /**
   * Display alerts if any
   */
  displayAlerts(): void {
    const alerts = this._core.alerts.flat;

    if (alerts.length === 0) {
      return;
    }

    console.log(pc.bold(pc.red("⚠ Alerts:")));
    for (const alert of alerts) {
      console.log(`  ${pc.red("•")} ${alert.message}`);
    }
    console.log();
  }

  /**
   * Log a message (respects color settings)
   */
  private _log(message: string): void {
    if (this._colors) {
      console.log(message);
    } else {
      // Strip colors if disabled
      console.log(message.replace(/\x1b\[[0-9;]*m/g, ""));
    }
  }

  /**
   * Color HTTP method based on type
   */
  private _colorMethod(method: string): string {
    switch (method.toUpperCase()) {
      case "GET":
        return pc.green(pc.bold("GET   "));
      case "POST":
        return pc.blue(pc.bold("POST  "));
      case "PUT":
        return pc.yellow(pc.bold("PUT   "));
      case "PATCH":
        return pc.cyan(pc.bold("PATCH "));
      case "DELETE":
        return pc.red(pc.bold("DELETE"));
      default:
        return pc.gray(pc.bold(method.padEnd(6)));
    }
  }
}
