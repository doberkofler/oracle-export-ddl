# Agent Guidelines: oracle-export-ddl

This document provides essential information for autonomous agents (like Cursor, GitHub Copilot, or CLI agents) working on the `oracle-export-ddl` repository.

## Project Overview
A Node.js CLI tool to export Oracle procedural objects (Packages, Procedures, Functions, Types, Triggers) from `USER_SOURCE` to individual physical files.

## Build, Lint, and Test Commands

### Core Commands
- **Install dependencies:** `npm install`
- **Build project:** `npm run build` (uses `tsdown` to bundle into `dist/`)
- **Lint code:** `npm run lint` (runs `tsc`, `oxlint`, and `prettier`)
- **Run all tests:** `npm run test` (uses `vitest`)
- **Run CI suite:** `npm run ci` (lint + build + test)

### Targeted Testing
- **Run a single test file:** `npx vitest src/lib.test.ts`
- **Run tests matching a pattern:** `npx vitest -t "resolveExt"`
- **Watch mode:** `npx vitest`

## Code Style & Conventions

### Language & Runtime
- **TypeScript:** Strict mode enabled.
- **Node.js:** Targets >= 22.0.0.
- **ESM:** The project uses ES Modules (`"type": "module"` in `package.json`).

### Imports
- **Extensions:** Always use `.js` or `.mjs` extensions in relative imports (e.g., `import { main } from './lib.js';`) to comply with ESM requirements in Node.js, even though the source files are `.ts`.
- **Built-ins:** Use the `node:` prefix for built-in modules (e.g., `import path from 'node:path';`).

### Formatting
- **Tooling:** Prettier is enforced via `npm run lint`.
- **Indentation:** Tabs are used for indentation.
- **Quotes:** Single quotes for strings, except when double quotes prevent escaping.

### Types & Schema Validation
- **Zod:** Use `zod` for runtime schema validation, especially for database results (see `SourceRowSchema`).
- **Inference:** Prefer `z.infer<typeof Schema>` for defining types derived from schemas.

### Naming Conventions
- **Variables/Functions:** `camelCase`.
- **Constants:** `UPPER_SNAKE_CASE`.
- **Files:** `kebab-case.ts`.
- **Oracle Types:** Oracle-specific strings (like object types) should be handled as `UPPER CASE` as they appear in the data dictionary.

### Error Handling
- **CLI Errors:** Throw descriptive errors in `main` or core logic; the caller should handle logging to the console.
- **Database:** Ensure connections are always closed in a `finally` block.

### Project Structure
- `src/index.ts`: CLI Entry point (minimal logic).
- `src/lib.ts`: Core business logic and exports.
- `src/lib.test.ts`: Unit tests for the library.
- `dist/`: Build artifacts (do not edit directly).

## Git Workflow
- **Conventional Commits:** Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification (e.g., `feat:`, `fix:`, `chore:`, `test:`).
- **Hooks:** Husky is configured to run `npm run ci` on pre-commit and `commitlint` on commit-msg. Do not bypass these hooks.

## Environment Variables
- `ORACLE_SERVER`: Default Oracle connection string.
- `ORACLE_USER`: Default Oracle username.
- `ORACLE_PASSWORD`: Default Oracle password.
