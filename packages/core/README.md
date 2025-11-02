# @ghost-file-analyzer/core

> Core static analysis engine for Ghost File Analyzer

---

## Overview

This package contains the core logic and algorithms for analyzing unused files and dead code in JavaScript/TypeScript projects. It is designed to be reusable and framework-agnostic.

---

## Installation

```bash
pnpm add @ghost-file-analyzer/core
```

---

## Usage

Import and use the analysis engine in your own tools or scripts:

```ts
import { analyzeProject } from "@ghost-file-analyzer/core";

const result = await analyzeProject({
  projectRoot: "./my-app",
  configPath: "./my-config.json",
});

console.log(result.unusedFiles);
```

---

## API

- `analyzeProject(options)` — Analyze a project for unused files
  - `options.projectRoot` (string): Path to the project root
  - `options.configPath` (string, optional): Path to config file
  - Returns: `{ unusedFiles: string[], deadCode: string[] }`

---

## Development

- Run in dev mode: `pnpm start:dev`
- Build: `pnpm build`
- Lint: `pnpm lint`

---

## Contributing

See the [main monorepo README](../../README.md#contributing).

---

## License

[MIT](../../LICENSE)
