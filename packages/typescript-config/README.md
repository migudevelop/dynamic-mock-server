# @dynamic-mock-server/typescript-config

> **Internal package — not published to npm. For use within the Dynamic Mock Server monorepo only.**

Shared TypeScript configuration for the Dynamic Mock Server monorepo. Provides a centralized `tsconfig.json` base configuration that all packages extend, ensuring consistent TypeScript compiler settings across the workspace.

## Features

- ✅ **Strict Type Checking**: Enabled for maximum type safety
- ⚡ **ES2022 Target**: Modern JavaScript features support
- 📦 **ESM Modules**: NodeNext resolution for full package.json `exports` support
- 🔁 **Consistent Settings**: Unified compiler options for all packages
- 🔒 **Strict Index Access**: `noUncheckedIndexedAccess` enabled by default

## Usage

### In Package tsconfig.json

Extend the base configuration in your package's `tsconfig.json`:

```json
{
  "extends": "../typescript-config/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### Example Package Structure

```
packages/
  your-package/
    src/
      index.ts
    tsconfig.json  <- Extends ../typescript-config/base.json
    package.json
```

## Base Configuration

The `base.json` file includes these key settings:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "moduleDetection": "force",
    "declaration": true,
    "declarationMap": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "incremental": false
  }
}
```

## Compiler Options Explained

### Type Checking

- `strict: true` - Enables all strict type-checking options
- `noUncheckedIndexedAccess: true` - Adds `undefined` to array index access types for safer code

### Module System

- `module: "NodeNext"` - Use NodeNext module system (supports ESM and CJS)
- `moduleResolution: "NodeNext"` - Node.js module resolution with full `package.json` exports support
- `moduleDetection: "force"` - Treats all files as modules
- `isolatedModules: true` - Enables per-file transpilation (required for esbuild/tsup)
- `target: "ES2022"` - Compile to modern JavaScript
- `lib: ["ES2022"]` - Include ES2022 standard library

### Interoperability

- `esModuleInterop: true` - Better CommonJS/ESM interop
- `resolveJsonModule: true` - Allow importing JSON files

### Output

- `declaration: true` - Generate `.d.ts` files
- `declarationMap: true` - Generate source maps for declarations
- `incremental: false` - Disabled to avoid stale cache issues in CI

### Performance

- `skipLibCheck: true` - Skip type checking of declaration files for faster builds

## Customizing Per Package

While packages should extend the base config, you can override specific options:

```json
{
  "extends": "../typescript-config/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

## Build Commands

### Using tsc

```bash
# Build with TypeScript compiler
tsc -b

# Watch mode
tsc -b --watch

# Clean build artifacts
tsc -b --clean
```

### Using tsup (recommended)

Most packages use `tsup` which respects the TypeScript configuration:

```bash
# Build with tsup
pnpm build

# Watch mode
pnpm dev
```

## Best Practices

1. **Always Extend**: Don't copy the base config, extend it
2. **Minimal Overrides**: Only override when necessary
3. **Package-Specific Settings**: Set `outDir`, `rootDir`, `include`, `exclude` in package configs
4. **Strict Mode**: Keep `strict: true` for type safety
5. **Declaration Files**: Always generate `.d.ts` files for libraries

## Common Package Patterns

### Library Package

```json
{
  "extends": "../typescript-config/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
}
```

### CLI Package

```json
{
  "extends": "../typescript-config/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## Troubleshooting

### Module Resolution Issues

If you encounter module resolution errors:

1. Ensure `moduleResolution: "NodeNext"` is set
2. Check your `package.json` has correct `type: "module"`
3. Verify `exports` field in `package.json` matches your build output

### Type Errors in node_modules

If you see type errors from dependencies:

- `skipLibCheck: true` is already enabled in base config
- If issues persist, check dependency versions

### Declaration File Issues

If `.d.ts` files aren't generated:

1. Check `declaration: true` is set
2. Verify `outDir` is configured correctly
3. Ensure TypeScript version is compatible

## Related Packages

- [@dynamic-mock-server/eslint-config](../eslint-config/README.md) - ESLint configuration
- All packages in the monorepo extend this config

## Maintenance

To update compiler settings for all packages:

1. Modify `packages/typescript-config/base.json`
2. Run `pnpm build` from root to verify changes
3. Run `pnpm check-types` to validate across all packages

## License

Apache-2.0 © Miguel Martínez
