import { Core } from "@dynamic-mock-server/core";
import Logger from "@dynamic-mock-server/logger";
import { Command } from "commander";
import pc from "picocolors";

import { CLI } from "./cli.js";
import type { CLIOptions } from "./commander.types.js";
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
      .action(async (options: CLIOptions) => {
        await this._startCli(options);
      });
  }

  /**
   * Parse command line arguments
   */
  async parse(argv?: string[]): Promise<void> {
    await this._program.parseAsync(argv);
  }

  private async _getCli({
    interactive,
  }: CLIOptions): Promise<CLI | InteractiveCLI> {
    if (!interactive) {
      return new CLI({ core: this._core });
    }
    this._core = new Core({ logger: new Logger({ level: "silent" }) });
    return new InteractiveCLI(this._core);
  }

  /**
   * Start the cli with the given options
   */
  private async _startCli({ interactive }: CLIOptions): Promise<void> {
    console.log(pc.cyan("Starting Dynamic Mock Server CLI..."));

    try {
      // Normal logs in non-interactive mode
      this._cli = await this._getCli({ interactive });
      this._cli.start();
    } catch (error) {
      console.error(
        pc.red("Failed to start server:"),
        (error as Error).message
      );
      process.exit(1);
    }
  }
}
