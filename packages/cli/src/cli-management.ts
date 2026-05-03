import { Core } from "@dynamic-mock-server/core";
import Logger from "@dynamic-mock-server/logger";
import { Command } from "commander";
import pc from "picocolors";

import type { CLIArguments } from "./cli-management.types.js";
import { CLI } from "./cli.js";
import { InteractiveCLI } from "./interactive-cli.js";

/**
 * CLI management program for the CLI
 */
export class CliManagement {
  private _program: Command;
  private _core: Core;
  private _cli: CLI | InteractiveCLI;

  constructor(core?: Core) {
    this._core = core || new Core();
    this._cli = new CLI({ core: this._core });
    this._program = new Command();
    this._setupCommands();
  }

  /**
   * Get the commander program
   */
  get program(): Command {
    return this._program;
  }

  /**
   * Get the Core instance
   */
  get core(): Core {
    return this._core;
  }

  /**
   * Get the CLI instance
   */
  get cli(): CLI | InteractiveCLI {
    return this._cli;
  }

  /**
   * Setup all commands
   */
  private _setupCommands(): void {
    this._program
      .name("dynamic-mock-server")
      .description("Interactive CLI for Dynamic Mock Server")
      .version("0.0.1-beta");

    // Start command (interactive by default)
    this._program
      .description("Start the mock server (interactive by default)")
      .option("--no-interactive", "Disable interactive mode")
      .action(async (options: CLIArguments) => {
        await this._startCli(options);
      });

    // "start" command — starts the server (non-interactive)
    const startCmd = new Command("start")
      .description("Start the mock server")
      .action(async () => {
        await this._startCli({ interactive: false });
      });

    // "status" command
    const statusCmd = new Command("status")
      .description("Show server status")
      .action(async () => {
        const cli = new CLI({ core: this._core });
        await this._core.start();
        const status = await cli.getStatus();
        console.log(pc.bold("Server Status:"));
        console.log(
          `  Running: ${status.running ? pc.green("Yes") : pc.red("No")}`,
        );
        if (status.url) console.log(`  URL: ${pc.blue(status.url)}`);
        console.log(
          `  Active Suite: ${status.activeSuite ?? pc.yellow("None")}`,
        );
        console.log(`  Routes: ${status.totalRoutes}`);
        console.log(`  Suites: ${status.totalSuites}`);
        await this._core.stop();
      });

    // "suites" command with subcommands
    const suitesCmd = new Command("suites").description("Manage routes suites");

    suitesCmd
      .command("list")
      .description("List all available suites")
      .action(async () => {
        await this._core.start();
        const suites = this._core.mocksManager.getSuites();
        const activeSuite = this._core.mocksManager.getActiveSuite();
        if (suites.length === 0) {
          console.log(pc.yellow("No suites available"));
        } else {
          console.log(pc.bold("Available Suites:"));
          for (const suite of suites) {
            const marker =
              suite.id === activeSuite ? pc.green(" (active)") : "";
            console.log(`  ${suite.id}${marker}`);
          }
        }
        await this._core.stop();
      });

    suitesCmd
      .command("set <suiteId>")
      .description("Set the active suite")
      .action(async (suiteId: string) => {
        const cli = new CLI({ core: this._core });
        await this._core.start();
        await cli.changeSuite(suiteId);
        await this._core.stop();
      });

    suitesCmd
      .command("clear")
      .description("Clear the active suite")
      .action(async () => {
        const cli = new CLI({ core: this._core });
        await this._core.start();
        await cli.changeSuite(null);
        await this._core.stop();
      });

    // "routes" command with subcommands
    const routesCmd = new Command("routes").description("Manage routes");

    routesCmd
      .command("list")
      .description("List all available routes")
      .action(async () => {
        await this._core.start();
        const routes = this._core.mocksManager.getRoutes();
        if (routes.length === 0) {
          console.log(pc.yellow("No routes available"));
        } else {
          console.log(pc.bold("Available Routes:"));
          for (const route of routes) {
            const responses = route.responses
              .map((r: { id: string }) => r.id)
              .join(", ");
            console.log(
              `  ${pc.bold(route.method.padEnd(7))} ${pc.blue(route.url)} [${pc.gray(responses)}]`,
            );
          }
        }
        await this._core.stop();
      });

    routesCmd
      .command("set <routeId> <responseId>")
      .description("Override a route response")
      .action(async (routeId: string, responseId: string) => {
        const cli = new CLI({ core: this._core });
        await this._core.start();
        await cli.setRouteResponse(routeId, responseId);
        await this._core.stop();
      });

    routesCmd
      .command("clear <routeId>")
      .description("Clear a route response override")
      .action(async (routeId: string) => {
        const cli = new CLI({ core: this._core });
        await this._core.start();
        await cli.setRouteResponse(routeId, null);
        await this._core.stop();
      });

    this._program.addCommand(startCmd);
    this._program.addCommand(statusCmd);
    this._program.addCommand(suitesCmd);
    this._program.addCommand(routesCmd);
  }

  /**
   * Parse command line arguments
   */
  async parse(argv?: string[]): Promise<void> {
    await this._program.parseAsync(argv);
  }

  private async _getCli({
    interactive,
  }: CLIArguments): Promise<CLI | InteractiveCLI> {
    if (!interactive) {
      return new CLI({ core: this._core });
    }
    this._core = new Core({ logger: new Logger({ level: "silent" }) });
    return new InteractiveCLI(this._core);
  }

  /**
   * Start the cli with the given options
   */
  private async _startCli({ interactive }: CLIArguments): Promise<void> {
    console.log(pc.cyan("Starting Dynamic Mock Server CLI..."));

    try {
      // Normal logs in non-interactive mode
      this._cli = await this._getCli({ interactive });
      await this._cli.start();
    } catch (error) {
      console.error(
        pc.red("Failed to start server:"),
        (error as Error).message,
      );
      process.exit(1);
    }
  }
}
