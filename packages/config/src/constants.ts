import type { ConfigType } from "./config.types";

export const FILE_NAME = "dynamicMockServer";
const VALID_CONFIG_EXTENSIONS = ["json", "yaml", "yml", "js", "ts", "cjs"];
export const DEFAULT_SEARCH_PLACES = VALID_CONFIG_EXTENSIONS.map(
  (ext) => `${FILE_NAME}.config.${ext}`
);

export const DEFAULT_CONFIG: ConfigType = {
  logLevel: "trace",
  plugins: {
    register: [],
  },
  server: {
    port: 3000,
    host: "localhost",
  },
  routes: {
    selectedSuite: "default",
  },
  files: {
    enabled: true,
    watch: true,
    path: "mocks",
  },
};
