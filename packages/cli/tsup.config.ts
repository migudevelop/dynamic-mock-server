import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/bin.ts"],
  format: ["esm"],
  dts: false, // Temporarily disabled until workspace dependencies are resolved
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
});
