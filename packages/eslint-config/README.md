# @dynamic-mock-server/eslint-config

Shared ESLint configuration for the Dynamic Mock Server monorepo. Provides a centralized base configuration that all packages extend, ensuring consistent code style and quality across the workspace.

## Features

- ✅ **Consistent Code Style**: Unified linting rules for all packages
- ❗ **Error Prevention**: Catches common mistakes and anti-patterns
- 🔰 **Modern JavaScript**: Supports ES2022+ features
- 🧾 **TypeScript Support**: Full TypeScript linting capabilities
- ⚙️ **Extensible**: Easy to customize per package

## Installation

This package is internal to the monorepo and installed via workspace dependencies.

```json
{
  "devDependencies": {
    "@dynamic-mock-server/eslint-config": "workspace:*"
  }
}
```

## Usage

### In Package eslint.config.mjs

Import and use the base configuration:

```javascript
import baseConfig from "@dynamic-mock-server/eslint-config/base.js";

export default [
  ...baseConfig,
  {
    // Package-specific overrides
    rules: {
      // Your custom rules
    },
  },
];
```

### Example Package Structure

```
packages/
  your-package/
    src/
      index.ts
    eslint.config.mjs  <- Uses @dynamic-mock-server/eslint-config
    package.json
```

## Base Configuration

The `base.js` file provides foundational ESLint rules that emphasize:

- Code quality and consistency
- Error prevention
- Best practices for JavaScript/TypeScript
- Modern ECMAScript features

## Customizing Per Package

While packages should use the base config, you can add package-specific rules:

```javascript
import baseConfig from "@dynamic-mock-server/eslint-config/base.js";

export default [
  ...baseConfig,
  {
    rules: {
      // Disable a rule for this package
      "no-console": "off",

      // Change rule severity
      "prefer-const": "warn",

      // Add new rules
      "custom-rule": "error",
    },
  },
];
```

## Available Scripts

### Lint Package

```bash
# Lint a specific package
pnpm --filter @dynamic-mock-server/your-package run lint

# Lint all packages
pnpm lint
```

### Auto-fix

Most packages support auto-fixing:

```bash
# Fix issues in a package
pnpm --filter @dynamic-mock-server/your-package run lint --fix

# Fix all packages
pnpm lint --fix
```

## Integration with Prettier

This configuration is designed to work alongside Prettier. Use `lint-staged` for pre-commit hooks:

```json
{
  "lint-staged": {
    "*.{js,ts,mjs,cjs}": ["prettier --write", "eslint --fix"]
  }
}
```

## Best Practices

1. **Use Base Config**: Always extend the base configuration
2. **Minimal Overrides**: Only override rules when absolutely necessary
3. **Document Changes**: Comment why you're overriding a rule
4. **Keep It Consistent**: Avoid per-file rule changes when possible
5. **Run Lint Often**: Integrate linting into your development workflow

## Common Patterns

### Library Package

```javascript
import baseConfig from "@dynamic-mock-server/eslint-config/base.js";

export default [
  ...baseConfig,
  {
    files: ["src/**/*.ts"],
    rules: {
      // Library-specific rules
    },
  },
];
```

### CLI Package

```javascript
import baseConfig from "@dynamic-mock-server/eslint-config/base.js";

export default [
  ...baseConfig,
  {
    files: ["src/**/*.ts"],
    rules: {
      "no-console": "off", // Console allowed in CLI
    },
  },
];
```

### Test Files

```javascript
import baseConfig from "@dynamic-mock-server/eslint-config/base.js";

export default [
  ...baseConfig,
  {
    files: ["**/*.test.ts", "**/*.spec.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // More lenient in tests
    },
  },
];
```

## Troubleshooting

### ESLint Version Conflicts

If you encounter version conflicts:

1. Ensure all packages use the same ESLint version
2. Check `peerDependencies` in the base config
3. Run `pnpm install` to sync versions

### Rule Conflicts

If rules conflict with your code:

1. First, consider if the code should be refactored
2. If the rule doesn't apply, override it locally with a comment
3. For persistent issues, override in your package's config

### IDE Integration

For best experience in VS Code:

1. Install the ESLint extension
2. Add to `.vscode/settings.json`:

```json
{
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## Related Packages

- [@dynamic-mock-server/typescript-config](../typescript-config/README.md) - TypeScript configuration
- All packages in the monorepo use this config

## Maintenance

To update linting rules for all packages:

1. Modify `packages/eslint-config/base.js`
2. Run `pnpm lint` from root to verify changes
3. Fix any new linting errors across packages
4. Update this README if significant changes are made

## Rules Philosophy

The base configuration follows these principles:

- **Safety First**: Prefer rules that prevent bugs
- **Readability**: Enforce consistent, readable code
- **Modern Practices**: Support latest ECMAScript features
- **Developer Experience**: Balance strictness with productivity

## License

Apache-2.0 © Miguel Martínez
