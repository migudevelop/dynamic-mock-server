import { readFileSync } from "fs";

import { defineConfig } from "tsup";

const packageJson = JSON.parse(readFileSync("./package.json", "utf-8"));

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  outDir: "dist",
  define: {
    PACKAGE_VERSION: JSON.stringify(packageJson.version),
  },
  external: [
    "@dynamic-mock-server/alerts",
    "@dynamic-mock-server/config",
    "@dynamic-mock-server/logger",
    "@dynamic-mock-server/mocks-manager",
    "fastify",
  ],
  cjsInterop: true,
  outExtension({ format }) {
    return {
      js: format === "cjs" ? ".cjs" : ".js",
    };
  },
});
