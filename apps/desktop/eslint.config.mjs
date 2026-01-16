import baseConfig from "@dynamic-mock-server/eslint-config/base.js";
import { globalIgnores } from "eslint/config";

export default [
  ...baseConfig,
  globalIgnores(["out/**", "build/**", "dist/**", "src/components/shadcn/**"]),
];
