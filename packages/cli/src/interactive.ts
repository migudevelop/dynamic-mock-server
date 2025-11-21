import * as clack from "@clack/prompts";
import pc from "picocolors";
import type { Core } from "@dynamic-mock-server/core";
import type { CLI } from "./cli.js";

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

    clack.intro(
      pc.bgCyan(pc.black(" Dynamic Mock Server - Interactive Mode "))
    );

    await this._showStatus();

    while (this._running) {
      const action = await clack.select({
        message: "What would you like to do?",
        options: [
          { value: "status", label: "[i] Show server status" },
          { value: "suite", label: "[*] Change routes suite" },
          { value: "routes", label: "[>] View routes" },
          { value: "response", label: "[~] Override route response" },
          { value: "restart", label: "[R] Restart server" },
          { value: "alerts", label: "[!] View alerts" },
          { value: "exit", label: "[x] Exit" },
        ],
      });

      if (clack.isCancel(action)) {
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
      case "status":
        await this._showStatus();
        break;
      case "suite":
        await this._changeSuite();
        break;
      case "routes":
        await this._viewRoutes();
        break;
      case "response":
        await this._overrideResponse();
        break;
      case "restart":
        await this._restartServer();
        break;
      case "alerts":
        await this._viewAlerts();
        break;
      case "exit":
        await this._exit();
        break;
    }
  }

  /**
   * Show server status
   */
  private async _showStatus(): Promise<void> {
    const spinner = clack.spinner();
    spinner.start("Loading status...");

    const status = await this._cli.getStatus();

    spinner.stop("Status loaded");

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

  /**
   * Change active routes suite
   */
  private async _changeSuite(): Promise<void> {
    const suites = this._core.mocksManager.getSuites();
    const currentSuite = this._core.mocksManager.getActiveSuite();

    if (suites.length === 0) {
      clack.log.warning("No suites available");
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

    const suiteId = await clack.select({
      message: "Select routes suite:",
      options,
    });

    if (clack.isCancel(suiteId)) {
      clack.log.info("Cancelled");
      return;
    }

    const spinner = clack.spinner();
    spinner.start("Changing suite...");

    await this._cli.changeSuite(suiteId as string | null);

    spinner.stop(
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
      clack.log.warning("No routes available");
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
      clack.log.warning("No routes available");
      return;
    }

    const routeOptions = routes.map(
      (route: { id: string; method: string; url: string }) => ({
        value: route.id,
        label: `${route.method} ${route.url}`,
      })
    );

    const routeId = await clack.select({
      message: "Select route:",
      options: routeOptions,
    });

    if (clack.isCancel(routeId)) {
      clack.log.info("Cancelled");
      return;
    }

    const route = this._core.mocksManager.getRoute(routeId as string);
    if (!route) {
      clack.log.error("Route not found");
      return;
    }

    const responseOptions = [
      { value: null, label: pc.yellow("(Clear override)") },
      ...route.responses.map((response: { id: string }) => ({
        value: response.id,
        label: response.id,
      })),
    ];

    const responseId = await clack.select({
      message: "Select response:",
      options: responseOptions,
    });

    if (clack.isCancel(responseId)) {
      clack.log.info("Cancelled");
      return;
    }

    const spinner = clack.spinner();
    spinner.start("Setting response...");

    await this._cli.setRouteResponse(
      routeId as string,
      responseId as string | null
    );

    spinner.stop(
      responseId
        ? `Response set to: ${pc.green(responseId as string)}`
        : "Response override cleared"
    );
  }

  /**
   * Restart the server
   */
  private async _restartServer(): Promise<void> {
    const confirm = await clack.confirm({
      message: "Are you sure you want to restart the server?",
    });

    if (clack.isCancel(confirm) || !confirm) {
      clack.log.info("Cancelled");
      return;
    }

    const spinner = clack.spinner();
    spinner.start("Restarting server...");

    try {
      await this._cli.restartServer();
      spinner.stop(pc.green("Server restarted successfully ✓"));
    } catch (error) {
      spinner.stop(pc.red("Failed to restart server"));
      clack.log.error((error as Error).message);
    }
  }

  /**
   * View alerts
   */
  private async _viewAlerts(): Promise<void> {
    const alerts = this._core.alerts.flat;

    if (alerts.length === 0) {
      clack.log.success("No alerts");
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
    clack.outro(pc.cyan("Thanks for using Dynamic Mock Server!"));
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
