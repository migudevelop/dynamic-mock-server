import { Command } from "commander";
import pc from "picocolors";
import { Core } from "@dynamic-mock-server/core";
import { CLI } from "./cli.js";
import { InteractiveCLI } from "./interactive.js";

/**
 * Commander program for the CLI
 */
export class Commander {
  private _program: Command;
  private _core: Core;
  private _cli: CLI;

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
  get cli(): CLI {
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
      .command("start")
      .description("Start the mock server (interactive by default)")
      .option("-p, --port <port>", "Server port", "3000")
      .option("-h, --host <host>", "Server host", "localhost")
      .option("--no-interactive", "Disable interactive mode")
      .action(
        async (options: {
          port?: string;
          host?: string;
          interactive?: boolean;
        }) => {
          await this._startServer(options);
        }
      );

    // Status command
    this._program
      .command("status")
      .description("Show server status")
      .action(async () => {
        await this._status();
      });

    // Suites commands
    const suitesCmd = this._program
      .command("suites")
      .description("Manage routes suites");

    suitesCmd
      .command("list")
      .alias("ls")
      .description("List available suites")
      .action(async () => {
        await this._listSuites();
      });

    suitesCmd
      .command("set <suiteId>")
      .description("Set active suite")
      .action(async (suiteId: string) => {
        await this._setSuite(suiteId);
      });

    suitesCmd
      .command("clear")
      .description("Clear active suite")
      .action(async () => {
        await this._clearSuite();
      });

    // Routes commands
    const routesCmd = this._program
      .command("routes")
      .description("Manage routes");

    routesCmd
      .command("list")
      .alias("ls")
      .description("List available routes")
      .action(async () => {
        await this._listRoutes();
      });

    routesCmd
      .command("set <routeId> <responseId>")
      .description("Set route response")
      .action(async (routeId: string, responseId: string) => {
        await this._setRouteResponse(routeId, responseId);
      });

    routesCmd
      .command("clear <routeId>")
      .description("Clear route response override")
      .action(async (routeId: string) => {
        await this._clearRouteResponse(routeId);
      });

    // Restart command
    this._program
      .command("restart")
      .description("Restart the server")
      .action(async () => {
        await this._restart();
      });
  }

  /**
   * Parse command line arguments
   */
  async parse(argv?: string[]): Promise<void> {
    await this._program.parseAsync(argv);
  }

  /**
   * Start server command
   */
  private async _startServer(options: {
    port?: string;
    host?: string;
    interactive?: boolean;
  }): Promise<void> {
    console.log(pc.cyan("Starting Dynamic Mock Server..."));

    try {
      // Note: CLI options for port/host should be handled differently
      // as mutating config directly is not recommended.
      // For now, we'll log a warning if these options are used.
      if (options.port || options.host) {
        console.log(
          pc.yellow(
            "Warning: Port and host CLI options are not yet implemented. Use config file instead."
          )
        );
      }

      await this._core.start();

      const status = await this._cli.getStatus();
      console.log(pc.green(`✓ Server started at ${status.url}`));

      // Interactive mode by default (unless --no-interactive is passed)
      if (options.interactive !== false) {
        await this._cli.start();
        const interactive = new InteractiveCLI(this._core, this._cli);
        await interactive.start();
      } else {
        // Non-interactive mode: just keep server running
        console.log(pc.cyan("\nServer is running. Press Ctrl+C to stop."));

        // Keep process alive
        process.on("SIGINT", async () => {
          console.log(pc.yellow("\nShutting down..."));
          await this._core.stop();
          await this._cli.stop();
          process.exit(0);
        });

        // Keep process alive
        await new Promise(() => {});
      }
    } catch (error) {
      console.error(
        pc.red("Failed to start server:"),
        (error as Error).message
      );
      process.exit(1);
    }
  }

  /**
   * Status command
   */
  private async _status(): Promise<void> {
    try {
      await this._cli.showStatus();
    } catch (error) {
      console.error(pc.red("Failed to get status:"), (error as Error).message);
      process.exit(1);
    }
  }

  /**
   * List suites command
   */
  private async _listSuites(): Promise<void> {
    try {
      await this._cli.listSuites();
    } catch (error) {
      console.error(pc.red("Failed to list suites:"), (error as Error).message);
      process.exit(1);
    }
  }

  /**
   * Set suite command
   */
  private async _setSuite(suiteId: string): Promise<void> {
    try {
      await this._cli.changeSuite(suiteId);
      console.log(pc.green(`✓ Active suite set to: ${suiteId}`));
    } catch (error) {
      console.error(pc.red("Failed to set suite:"), (error as Error).message);
      process.exit(1);
    }
  }

  /**
   * Clear suite command
   */
  private async _clearSuite(): Promise<void> {
    try {
      await this._cli.changeSuite(null);
      console.log(pc.green("✓ Active suite cleared"));
    } catch (error) {
      console.error(pc.red("Failed to clear suite:"), (error as Error).message);
      process.exit(1);
    }
  }

  /**
   * List routes command
   */
  private async _listRoutes(): Promise<void> {
    try {
      await this._cli.listRoutes();
    } catch (error) {
      console.error(pc.red("Failed to list routes:"), (error as Error).message);
      process.exit(1);
    }
  }

  /**
   * Set route response command
   */
  private async _setRouteResponse(
    routeId: string,
    responseId: string
  ): Promise<void> {
    try {
      await this._cli.setRouteResponse(routeId, responseId);
      console.log(
        pc.green(`✓ Route ${routeId} response set to: ${responseId}`)
      );
    } catch (error) {
      console.error(
        pc.red("Failed to set route response:"),
        (error as Error).message
      );
      process.exit(1);
    }
  }

  /**
   * Clear route response command
   */
  private async _clearRouteResponse(routeId: string): Promise<void> {
    try {
      await this._cli.setRouteResponse(routeId, null);
      console.log(pc.green(`✓ Route ${routeId} response override cleared`));
    } catch (error) {
      console.error(
        pc.red("Failed to clear route response:"),
        (error as Error).message
      );
      process.exit(1);
    }
  }

  /**
   * Restart command
   */
  private async _restart(): Promise<void> {
    try {
      await this._cli.restartServer();
      console.log(pc.green("✓ Server restarted"));
    } catch (error) {
      console.error(
        pc.red("Failed to restart server:"),
        (error as Error).message
      );
      process.exit(1);
    }
  }
}
