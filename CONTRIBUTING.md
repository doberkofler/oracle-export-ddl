# Developer Guide: oracle-export-ddl

This guide provides instructions for developers and agentic coding assistants working in this repository.

## Instructions for AI Agents

When working in this repository, please:
1.  **Always run tests:** Before submitting any change, run `npm run test` and ensure all tests pass.
2.  **Verify coverage:** Ensure that coverage remains at 100% for all files (excluding `types.ts`).
3.  **Lint your changes:** Run `npm run lint` to ensure your code follows the project's style.
4.  **Follow Conventions:** Use **Tabs** for indentation and **Single Quotes** for strings.
5.  **Conventional Commits:** Use the `type(scope): subject` format for commits.

## Project Overview

`oracle-export-ddl` is a CLI tool designed to help developers incrementally adopt stricter ESLint rules.
 It allows you to test a set of rules against your codebase and generates a report showing which files would fail, without actually modifying your existing ESLint configuration.

## Tech Stack

- **Runtime:** Node.js (>=22.12.0)
- **Language:** TypeScript (ES2022 / ESNext)
- **Libraries:** `commander` (CLI), `zod` (Validation), `strip-json-comments` (JSONC), `cli-progress` (Progress bar), `ansis` (Colors), `tinyglobby` (File globbing)
- **Bundler:** `tsdown` (based on `rolldown`)
- **Testing:** `vitest` with `v8` coverage
- **Linting:** `eslint` 9+ (Flat Config), `typescript-eslint`, `prettier`
- **JSDoc:** `eslint-plugin-jsdoc`

## Build and Development Commands

- **Build project:** `npm run build`
- **Development mode (watch):** `npm run dev`
- **Lint and type-check:** `npm run lint`
- **Run all tests with coverage:** `npm run test`
- **Run CI checks:** `npm run ci` (lint + build + test)

### Running Specific Tests

To run a specific test file or test case:
- **By file path:** `npx vitest run path/to/file.test.ts`
- **By test name:** `npx vitest -t "test name"`
- **Watch mode for specific file:** `npx vitest path/to/file.test.ts`

## Code Style Guidelines

### 1. Formatting
- **Indentation:** Use **Tabs**.
- **Quotes:** Use **Single Quotes** (`'`) for strings, except when double quotes are necessary to avoid escaping or in HTML.
- **Semicolons:** Always use semicolons.
- **Line Endings:** LF.

### 2. TypeScript and Types
- **Strict Mode:** Adhere to `strict: true` in `tsconfig.json`.
- **Type Definitions:** Prefer `type` over `interface` for object definitions (enforced by `@typescript-eslint/consistent-type-definitions`).
- **Explicit Returns:** Functions should have explicit return types.
- **Explicit Types:** Use explicit types for variables unless the initialization makes the type obvious.
- **No `any`:** Avoid using `any`. Use `unknown` or more specific types where possible.

### 3. Naming Conventions
- **Variables/Functions:** `camelCase`.
- **Constants (Global):** `UPPER_SNAKE_CASE`.
- **Types/Classes:** `PascalCase`.
- **Files:** Typically lowercase, kebab-case is allowed but not explicitly enforced (except where specified by plugins).

### 4. Imports
- **Built-in Modules:** Always use the `node:` prefix for Node.js built-in modules (e.g., `import path from 'node:path'`).
- **Organization:** Group imports by:
    1. Third-party libraries
    2. Node.js built-ins
    3. Internal modules

### 5. Error Handling
- Use `try...catch` blocks for asynchronous operations and external integrations.
- Throw descriptive `Error` objects for validation or logic failures.
- In the CLI entry point, catch and log errors gracefully before exiting with `process.exit(1)`.

### 6. Documentation (JSDoc)
- All public-facing functions and types should have JSDoc comments.
- Follow the `typescript` mode for JSDoc.
- Omit types in JSDoc tags (like `@param` and `@returns`) since they are already specified in TypeScript, but provide meaningful descriptions.

### 7. ESLint Practices
- Follow the rules defined in `eslint.config.js`.
- This project uses `strictTypeChecked` and `stylisticTypeChecked` from `typescript-eslint`.
- `curly: 'error'` is enabled.
- Avoid disabling ESLint rules unless absolutely necessary. If required, use a comment explaining *why* it is disabled.

### 8. Commit Message Guidelines

We follow the **Conventional Commits** specification. This is **enforced** by `commitlint` and is required for automated changelog generation.

**Format:** `type(scope): subject`

**Common Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries such as documentation generation

**Examples:**
- `feat(cli): add support for jsonc files`
- `fix(parser): handle empty input gracefully`
- `docs: update contributing guidelines`

## Project Structure

- `src/index.ts`: CLI entry point.
- `src/lint.ts`: Core linting logic using ESLint API.
- `src/rules.ts`: Rules file parsing and validation with Zod.
- `src/report-console.ts`: Colored CLI report generation.
- `src/report-html.ts`: Interactive HTML report generation.
- `src/types.ts`: Shared type definitions.
- `dist/`: Compiled output (ignored by git).
- `package.json`: Dependencies and scripts.
- `eslint.config.js`: Linting configuration.
- `vitest.config.ts`: Testing configuration.

## Development Workflow

1.  **Analyze:** Understand the task and the existing code.
2.  **Plan:** Break down the implementation steps.
3.  **Implement:** Write clean, type-safe code following the guidelines.
4.  **Verify:**
    -   Run `npm run lint` to ensure style and types are correct.
    -   Run `npm run test` to verify logic.
    -   Run `npm run build` to ensure the project still compiles.
5.  **Document:** Update JSDoc or `README.md` if necessary.

## Release Process

1. **Verify**: `npm run ci`
2. **Bump Version**: `npm version <patch|minor|major> --no-git-tag-version`
3. **Update Changelog**: `npm run create-changelog`
4. **Commit**: `git add . && git commit -m "chore(release): $(node -p 'require("./package.json").version')"`
5. **Tag & Push**: `git tag v$(node -p 'require("./package.json").version') && git push && git push --tags`
6. **Create GitHub Release**: `gh release create v$(node -p 'require("./package.json").version') --generate-notes`
7. **Publish**: `npm publish`
