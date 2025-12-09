import {
  intro,
  select,
  isCancel,
  spinner,
  log,
  confirm,
  outro,
  note,
} from "@clack/prompts";
import type { Core } from "@dynamic-mock-server/core";
import pc from "picocolors";

import type { CLI } from "./cli.js";
import {
  INTERACTIVE_OPTIONS,
  INTERACTIVE_OPTIONS_VALUES_MAP,
} from "./contants.js";

/**
 * Interactive CLI mode using @clack/prompts
 */
export class InteractiveCLI {
  private _core: Core;
  private _cli: CLI;
  private _running = false;

  constructor(core: Core, cli: CLI) {
    this._core = core;
    this._cli = cli;
  }

  /**
   * Start interactive mode
   */
  async start(): Promise<void> {
    this._running = true;

    intro(pc.bgCyan(pc.black(" Dynamic Mock Server - Interactive Mode ")));

    await this._showStatus();

    while (this._running) {
      const action = await select({
        message: "What would you like to do?",
        options: INTERACTIVE_OPTIONS,
      });
      console.clear();
      if (isCancel(action)) {
        await this._exit();
        break;
      }
      await this._handleAction(action as string);
    }
  }

  /**
   * Stop interactive mode
   */
  async stop(): Promise<void> {
    this._running = false;
  }

  /**
   * Handle user action
   */
  private async _handleAction(action: string): Promise<void> {
    switch (action) {
      case INTERACTIVE_OPTIONS_VALUES_MAP.STATUS:
        await this._showStatus();
        break;
      case INTERACTIVE_OPTIONS_VALUES_MAP.CONFIG:
        await this._getConfiguration();
        break;
      case INTERACTIVE_OPTIONS_VALUES_MAP.SUITE:
        await this._changeSuite();
        break;
      case INTERACTIVE_OPTIONS_VALUES_MAP.ROUTES:
        await this._viewRoutes();
        break;
      case INTERACTIVE_OPTIONS_VALUES_MAP.RESPONSE:
        await this._overrideResponse();
        break;
      case INTERACTIVE_OPTIONS_VALUES_MAP.RESTART:
        await this._restartServer();
        break;
      case INTERACTIVE_OPTIONS_VALUES_MAP.ALERTS:
        await this._viewAlerts();
        break;
      case INTERACTIVE_OPTIONS_VALUES_MAP.EXIT:
        await this._exit();
        break;
    }
  }

  /**
   * Show server status
   */
  private async _showStatus(): Promise<void> {
    const loader = spinner();
    loader.start("Loading status...");

    const status = await this._cli.getStatus();

    loader.stop("Status loaded");
    console.clear();
    console.log(pc.bold(pc.cyan("╔════════════════════════════════════════╗")));
    console.log(pc.bold(pc.cyan("║       Dynamic Mock Server Status       ║")));
    console.log(pc.bold(pc.cyan("╚════════════════════════════════════════╝")));

    console.log();
    console.log(pc.bold("Server Information:"));
    console.log(
      `  Status: ${status.running ? pc.green("Running ✓") : pc.red("Stopped ✗")}`
    );
    if (status.url) {
      console.log(`  URL: ${pc.blue(status.url)}`);
    }
    console.log(
      `  Active Suite: ${status.activeSuite ? pc.green(status.activeSuite) : pc.yellow("None")}`
    );
    console.log(`  Routes: ${pc.cyan(status.totalRoutes.toString())}`);
    console.log(`  Responses: ${pc.cyan(status.totalResponses.toString())}`);
    console.log(`  Suites: ${pc.cyan(status.totalSuites.toString())}`);
    console.log();
  }

  private async _getConfiguration(): Promise<void> {
    const config = this._core.config.getConfig();
    note(JSON.stringify(config, null, 2), "Current Server Configuration:");
  }

  /**
   * Change active routes suite
   */
  private async _changeSuite(): Promise<void> {
    const suites = this._core.mocksManager.getSuites();
    const currentSuite = this._core.mocksManager.getActiveSuite();

    if (suites.length === 0) {
      log.warning("No suites available");
      return;
    }

    const options = [
      { value: null, label: pc.yellow("(Clear active suite)") },
      ...suites.map((suite: { id: string }) => ({
        value: suite.id,
        label:
          suite.id === currentSuite
            ? pc.green(`${suite.id} (current)`)
            : suite.id,
      })),
    ];

    const suiteId = await select({
      message: "Select routes suite:",
      options,
    });

    if (isCancel(suiteId)) {
      log.info("Cancelled");
      return;
    }

    const loader = spinner();
    loader.start("Changing suite...");

    await this._cli.changeSuite(suiteId as string | null);

    loader.stop(
      suiteId
        ? `Suite changed to: ${pc.green(suiteId as string)}`
        : "Active suite cleared"
    );
  }

  /**
   * View all routes
   */
  private async _viewRoutes(): Promise<void> {
    const routes = this._core.mocksManager.getRoutes();

    if (routes.length === 0) {
      log.warning("No routes available");
      return;
    }

    console.log();
    console.log(pc.bold("Available Routes:"));
    console.log();

    for (const route of routes) {
      const method = this._colorMethod(route.method);
      const url = pc.blue(route.url);
      console.log(`  ${method} ${url}`);

      const activeResponse = this._core.mocksManager.resolveResponse(route.id);
      if (activeResponse) {
        console.log(`    ${pc.green("→")} ${pc.gray(activeResponse.id)}`);
      }

      console.log(
        `    ${pc.gray(`Available: ${route.responses.map((r: { id: string }) => r.id).join(", ")}`)}`
      );
      console.log();
    }
  }

  /**
   * Override a route response
   */
  private async _overrideResponse(): Promise<void> {
    const routes = this._core.mocksManager.getRoutes();

    if (routes.length === 0) {
      log.warning("No routes available");
      return;
    }

    const routeOptions = routes.map(
      (route: { id: string; method: string; url: string }) => ({
        value: route.id,
        label: `${route.method} ${route.url}`,
      })
    );

    const routeId = await select({
      message: "Select route:",
      options: routeOptions,
    });

    if (isCancel(routeId)) {
      log.info("Cancelled");
      return;
    }

    const route = this._core.mocksManager.getRoute(routeId as string);
    if (!route) {
      log.error("Route not found");
      return;
    }

    const responseOptions = [
      { value: null, label: pc.yellow("(Clear override)") },
      ...route.responses.map((response: { id: string }) => ({
        value: response.id,
        label: response.id,
      })),
    ];

    const responseId = await select({
      message: "Select response:",
      options: responseOptions,
    });

    if (isCancel(responseId)) {
      log.info("Cancelled");
      return;
    }

    const loader = spinner();
    loader.start("Setting response...");

    await this._cli.setRouteResponse(
      routeId as string,
      responseId as string | null
    );

    loader.stop(
      responseId
        ? `Response set to: ${pc.green(responseId as string)}`
        : "Response override cleared"
    );
  }

  /**
   * Restart the server
   */
  private async _restartServer(): Promise<void> {
    const confirmed = await confirm({
      message: "Are you sure you want to restart the server?",
    });

    if (isCancel(confirmed) || !confirmed) {
      log.info("Cancelled");
      return;
    }

    const spin = spinner();
    spin.start("Restarting server...");

    try {
      await this._cli.restartServer();
      spin.stop(pc.green("Server restarted successfully ✓"));
    } catch (error) {
      spin.stop(pc.red("Failed to restart server"));
      log.error((error as Error).message);
    }
  }

  /**
   * View alerts
   */
  private async _viewAlerts(): Promise<void> {
    const alerts = this._core.alerts.flat;

    if (alerts.length === 0) {
      log.success("No alerts");
      return;
    }

    console.log();
    console.log(pc.bold(pc.red("[!] Alerts:")));
    console.log();

    for (const alert of alerts) {
      console.log(`  ${pc.red("•")} ${alert.message}`);
    }
    console.log();
  }

  /**
   * Exit interactive mode
   */
  private async _exit(): Promise<void> {
    this._running = false;
    outro(pc.cyan("Thanks for using Dynamic Mock Server!"));
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
