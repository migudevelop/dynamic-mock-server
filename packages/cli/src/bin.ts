#!/usr/bin/env node
import { CliManagement } from "./cli-management.js";

/**
 * Main entry point for the CLI binary
 */
async function main(): Promise<void> {
  const cliManagement = new CliManagement();
  await cliManagement.parse(process.argv);
}

// Run the CLI
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
