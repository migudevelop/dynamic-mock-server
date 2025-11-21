#!/usr/bin/env node

import { Commander } from "./commander.js";

/**
 * Main entry point for the CLI binary
 */
async function main(): Promise<void> {
  const commander = new Commander();

  // If no command is provided, default to 'start' (interactive)
  const args = process.argv.slice(2);
  if (
    args.length === 0 ||
    (!args[0].startsWith("-") &&
      ![
        "start",
        "interactive",
        "i",
        "status",
        "suites",
        "routes",
        "restart",
      ].includes(args[0]))
  ) {
    process.argv.push("start");
  }

  await commander.parse(process.argv);
}

// Run the CLI
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
