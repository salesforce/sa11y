# Codebase Patterns

## Patterns to Follow

### Package Entry Point Pattern

Each package exposes a clean `src/index.ts` that re-exports the public API. Internal implementation files are not re-exported.

**Example**: `packages/assert/src/index.ts`, `packages/jest/src/index.ts`

### Async API with Optional Parameters

All core accessibility APIs are async and accept optional configuration:

```typescript
// Defaults to document, base ruleset, A11yError formatter
await assertAccessible();

// Override context, ruleset, or formatter
await assertAccessible(element, full, null);
```

Follow this pattern when adding new public APIs: make all non-critical params optional with sensible defaults.

### Environment Variable Feature Flags

Feature flags use `process.env` with a `SA11Y_` prefix:

| Variable | Package | Purpose |
|----------|---------|---------|
| `SA11Y_AUTO` | `@sa11y/jest`, `@sa11y/vitest` | Enable automatic per-test checks |
| `SA11Y_DEBUG` | all | Enable verbose logging |

Use `@sa11y/common` helpers for env detection — do not use `process.env.X` directly in package code.

### TypeScript Project References

Each package has its own `tsconfig.json` that:
- Extends `@tsconfig/node16/tsconfig.json` (root level)
- Declares `"composite": true` for project references
- Uses `"outDir": "./dist"` and `"rootDir": "./src"`

Root `tsconfig.json` uses `"references"` to list all packages — this enables incremental builds.

### Error Class Pattern

Accessibility errors are surfaced via the `A11yError` class in `@sa11y/format`:
- Extends `Error`
- Accumulates violations across axe results
- `checkAndThrow()` static method: throws only if violations exist

When adding new error reporting, use or extend `A11yError` rather than creating new error classes.

### Test Structure

- Tests live in `src/__tests__/` within each package
- Test file naming: `<subject>.spec.ts` (e.g., `matcher.spec.ts`)
- Use `@sa11y/test-utils` fixtures for DOM setup — do not create inline HTML in tests
- Each test file uses `beforeEach` to reset DOM and sa11y state

### Conventional Commits

All commits must follow conventional commit format (`feat:`, `fix:`, `chore:`, etc.) as enforced by commitlint. This drives semantic-release versioning. Use `yarn commit` for interactive guided commit.

## Patterns to Avoid

### Do Not Import Across Package Boundaries Without Declaration

If `@sa11y/jest` needs something from `@sa11y/matcher`, declare the dependency in `packages/jest/package.json`. Do not use relative paths that cross package boundaries — TypeScript project references enforce this.

### Do Not Modify `packages/browser-lib/dist/`

The browser-lib build output is generated. Changes will be overwritten by `yarn workspace @sa11y/browser-lib build`. Modify sources in `packages/browser-lib/src/` instead.

### Do Not Add Node-Only APIs to `browser-lib`

The browser bundle is loaded in actual browser environments via Selenium/WebdriverIO. Any `require('fs')`, `process.*`, or Node-only API will break browser execution.

### Do Not Use `axe.run` Directly in Test Assertions

Always go through `assertAccessible()` or `toBeAccessible()` — they handle error formatting, WCAG metadata enrichment, and exception list filtering. Direct `axe.run()` bypasses these layers.
