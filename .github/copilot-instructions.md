## Project description

Dynamic Mock Server is a development tool designed to facilitate the rapid creation, serving, and updating of API mocks. It supports hot-reload functionality, allowing developers to see changes in real-time without restarting the server. This accelerates the development and testing process by providing immediate feedback on API interactions.

## Repo snapshot

- Monorepo managed with pnpm workspaces (see `pnpm-workspace.yaml`) and TurboRepo (`turbo.json`) for task orchestration.
- Node >= 18 is required (`package.json` "engines"). Package manager: pnpm@9 (root `package.json`).

## Big picture (what you need to know)

- This repository is a small TypeScript monorepo of reusable packages under `packages/`.
- Primary package to inspect: `packages/core` — a TypeScript library that compiles to `dist` (see `packages/core/package.json` and `packages/core/tsconfig.json`).
- Tooling: builds and scripts are driven from the root `package.json` via `turbo run <task>` (root scripts: `build`, `dev`, `lint`, `check-types`).
- Lint and formatter: repository uses a local ESLint shareable config in `packages/eslint-config` and a TypeScript base config in `packages/typescript-config`.

## How to run / build / debug (concrete)

- Install deps (recommended):

  ```bash
  pnpm install
  ```

- Run the whole monorepo in dev/watch mode (turbo orchestrates):

  ```bash
  pnpm dev   # runs `turbo run dev`
  ```

- Build everything:

  ```bash
  pnpm build # runs `turbo run build`
  ```

- Build a single package (either with pnpm filtering or turbo filter):

  ```bash
  pnpm --filter @dynamic-mock-server/core run build
  # or
  pnpm build --filter=@dynamic-mock-server/core
  # with turbo directly
  turbo run build --filter=@dynamic-mock-server/core
  ```

- Linting (whole workspace):

  ```bash
  pnpm lint   # runs `turbo run lint`
  ```

## Project-specific conventions and patterns

- Packages use `workspace:*` for internal dependencies (see `packages/core/package.json`). Follow the `@dynamic-mock-server/*` name convention when adding new internal packages.
- TypeScript config inheritance: package tsconfigs extend `../typescript-config/base.json`. Add changes to the central config when you need to change compiler rules across the monorepo.
- ESLint shareable config is exported from `packages/eslint-config/base.js` and referenced locally by packages — modify there to change lint rules globally.
- Build output goes to `dist` for packages that publish (see `packages/core/package.json` `main`/`types` entries). Keep `dist` in `.gitignore` and use `files: ["dist"]` in package.json to define published artifacts.
- Test files (if any) should be placed alongside source files with a `.test.ts` suffix.
- Source files go in `src/` directories within each package.
- Use kebab-case for package folder and file names (e.g., `eslint-config`, `typescript-config`).
- Use destructuring in imports, arguments and let/const declarations where applicable for cleaner code.
- Use async/await for asynchronous code instead of raw Promises for better readability.
- Use functions to check types from types-guards
- Use english for all code, comments, and documentation.
- Avoid using `any` type; prefer specific types or generics.
- Add types and interfaces in ".types.ts" files, for example, routes-handlers.types.ts, responses-handler.types.ts
- Add a jsdoc comments for all functions and classes to describe their purpose, parameters, and return values. And add a little comment in the types and interfaces properties. eg.
  ```ts
  /**
   * Represents a user in the system.
   */
  interface User {
    /** The unique identifier for the user */
    id: string;
    /** The user's display name */
    name: string;
  }
  ```

## Integration points & external dependencies

- External runtime dependency shown in root `package.json`: `types-guards` (published package) — check for its API contract when changing types.
- Devtooling: `turbo`, `pnpm`, `typescript`, `eslint`, `prettier`, `husky`, `lint-staged` (root `package.json`).
- Git hooks: Husky is configured (`prepare` script). Commit conventions are enforced with `@commitlint/config-conventional` and `lint-staged` for pre-commit formatting and linting.

## Files to consult for authoritative behavior

- `package.json` (root) — workspace scripts and global dev deps (turbo, pnpm version, node engine).
- `pnpm-workspace.yaml` — which folders are considered packages.
- `turbo.json` — task graph, caching and `dev` persistence.
- `packages/core/package.json` — how the core package is built and exported (`tsc -b`, `dist` output, `exports`).
- `packages/core/tsconfig.json` and `packages/typescript-config/base.json` — TypeScript compiler conventions.
- `packages/eslint-config/base.js` and `packages/eslint-config/package.json` — lint rules and how to change them.
- `packages/*/README.md` — per-package documentation (some are placeholders; watch for stale copy like `packages/core/README.md`).

## Quick developer tips for agents (do this first)

1. Run `pnpm install` locally to populate the workspace and create symlinks for `workspace:*` deps.
2. Use `pnpm dev` for iterative development — turbo will attempt to run package `dev` scripts. If a package lacks `dev`, add a package-level `dev` script (e.g., `tsc -w` or a local watcher) so turbo can orchestrate it.
3. To change shared compiler or lint rules, update `packages/typescript-config/base.json` or `packages/eslint-config/base.js` and run `pnpm lint` and `pnpm build` to validate.
4. When editing `packages/core`, keep in mind it currently has an empty `src/index.ts` — check for placeholder content before assuming behavior.

## Example patterns to follow

- Adding a new package `@dynamic-mock-server/foo`:
  - create `packages/foo` with `package.json` using `name` prefix `@dynamic-mock-server/` and `files: ["dist"]`.
  - extend `../typescript-config/base.json` in `tsconfig.json`.
  - add `build` script (`tsc -b`) and `lint` script (`eslint src --ext .ts`).
  - run `pnpm --filter @dynamic-mock-server/foo run build` to vet the package.

## Known gaps / things to verify with maintainers

- Some README files (e.g., `packages/core/README.md`) look like placeholders and may be stale; confirm intended responsibilities.
- `packages/core/src/index.ts` is empty — confirm if core is a scaffolded package or intentionally blank.

---

If anything here looks wrong, or you want more detail in any section (examples of import paths, preferred test runner, CI steps), tell me which area to expand and I'll update this file.
