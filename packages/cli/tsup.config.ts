import { readFileSync } from "fs";

import { defineConfig } from "tsup";

const packageJson = JSON.parse(readFileSync("./package.json", "utf-8")) as {
  version: string;
};

export default defineConfig({
  entry: ["src/index.ts", "src/bin.ts"],
  format: ["esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  define: {
    PACKAGE_VERSION: JSON.stringify(packageJson.version),
  },
});
