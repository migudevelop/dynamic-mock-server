import { config } from "@dynamic-mock-server/eslint-config/base";

/** @type {import("eslint").Linter.Config} */
export default config.map((cfg) => {
  if (cfg.rules && cfg.rules["import/order"]) {
    // Remove import/order rule since the plugin is not available
    const { "import/order": _, ...restRules } = cfg.rules;
    return { ...cfg, rules: restRules };
  }
  return cfg;
});
