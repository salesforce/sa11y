# sa11y — Project Context

## Quick Orientation

- [README.md](../README.md) — Monorepo overview, package list, badges
- [CONTRIBUTING.md](../CONTRIBUTING.md) — Build, test, lint, commit, release workflow
- [CHANGELOG.md](../CHANGELOG.md) — Version history via semantic-release
- [SECURITY.md](../SECURITY.md) — Vulnerability reporting

## Architecture Overview

sa11y is a **Yarn workspaces monorepo** providing a family of accessibility testing libraries built on top of [axe-core](https://github.com/dequelabs/axe-core).

### Package Dependency Chain

```
axe-core (external)
  └─ @sa11y/preset-rules    — axe ruleset configurations (base/extended/full)
       └─ @sa11y/format     — result formatting, WCAG metadata, exception filtering
            └─ @sa11y/assert — assertAccessible() core API (throws on violations)
                 └─ @sa11y/matcher   — shared Jest+Vitest matcher logic (toBeAccessible)
                      ├─ @sa11y/jest    — Jest integration (matcher + automatic checks)
                      └─ @sa11y/vitest  — Vitest integration (matcher + automatic checks)
            └─ @sa11y/wdio       — WebdriverIO integration (browser-level a11y checks)
       └─ @sa11y/browser-lib — minified bundle for injection into browsers via Selenium/WDIO

Internal (private, not published):
  @sa11y/common        — shared env detection, helpers, error messages
  @sa11y/test-utils    — DOM fixtures, mock data, shared test helpers
  @sa11y/test-integration — cross-package integration tests
```

### How axe-core is used

Each package calls `axe.run(context, options)` where:
- `context` = a DOM element or `document`
- `options` = an axe configuration from `@sa11y/preset-rules` (base/extended/full)

Results flow through `@sa11y/format` which consolidates violations, adds WCAG metadata, applies exception filtering, and optionally groups results by test case.

## Key Directories

| Directory | Purpose |
|-----------|---------|
| `packages/assert/src/` | Core `assertAccessible()` API — throws `A11yError` on violations |
| `packages/matcher/src/` | `toBeAccessible()` shared matcher logic for Jest & Vitest |
| `packages/jest/src/` | Jest integration: setup, automatic checks, results processors |
| `packages/vitest/src/` | Vitest integration: setup, automatic checks |
| `packages/wdio/src/` | WebdriverIO integration: `assertAccessible()` for browser tests |
| `packages/format/src/` | Result formatting: `A11yError`, `A11yResult`, WCAG metadata |
| `packages/preset-rules/src/` | axe rule configurations: base, extended, full, custom rules |
| `packages/browser-lib/` | Browser bundle: minified sa11y for Selenium/WDIO injection |
| `packages/common/src/` | Shared utilities: env detection, helpers, constants |
| `packages/test-utils/src/` | Private: DOM fixtures with/without a11y issues, mock data |
| `packages/test-integration/` | Private: cross-package integration tests |
| `.github/workflows/` | CI: lint+build+test matrix (Node 20/22/24) + semantic-release |

## Key Files

| File | Purpose |
|------|---------|
| `packages/assert/src/index.ts` | Entry point: `assertAccessible()`, `A11yConfig`, `A11yError` |
| `packages/matcher/src/matcher.ts` | Shared `toBeAccessible()` implementation |
| `packages/jest/src/index.ts` | Jest entry: `setup()`, `toBeAccessible()` matcher registration |
| `packages/jest/src/automatic.ts` | Automatic a11y check after each test (SA11Y_AUTO env var) |
| `packages/format/src/format.ts` | `A11yError` class — consolidates and renders violations |
| `packages/preset-rules/src/base.ts` | Default WCAG 2.1 AA ruleset used in most integrations |
| `packages/preset-rules/src/index.ts` | Exports: base, extended, full rulesets + WCAG metadata |
| `packages/browser-lib/` | Build output only — generated via `yarn workspace @sa11y/browser-lib build` |
| `jest.config.js` | Root Jest config (delegates to per-package configs) |
| `tsconfig.json` | Root TypeScript project references config |
| `lerna.json` | Monorepo versioning config (version: 8.0.27, conventionalCommits) |

## Common Tasks

See [`.ai/common-tasks.md`](common-tasks.md) for step-by-step task workflows.

## Patterns

See [`.ai/patterns.md`](patterns.md) for coding conventions and patterns to follow/avoid.

## Gotchas

1. **Build order matters**: packages have TypeScript project references — run `yarn build` (not `tsc --build`) from the root. `yarn build:watch` for incremental development.

2. **`browser-lib` is built separately**: The root `build` script runs `tsc --build && yarn workspace @sa11y/browser-lib build`. If you only run `tsc --build` you won't get the browser bundle.

3. **`SA11Y_AUTO=1` mode**: The Jest integration can run a11y checks automatically after every test (no explicit `toBeAccessible()` call). This is controlled by the `SA11Y_AUTO` environment variable and tested via `packages/jest/src/automatic.ts`.

4. **`SA11Y_DEBUG=1` mode**: Enables verbose logging. The test:debug script wires this up alongside the Node inspector.

5. **Private packages are not published**: `@sa11y/common`, `@sa11y/test-utils`, and `@sa11y/test-integration` are private and consumed only within the monorepo. They appear in `tsconfig.json` references but not in `package.json` workspaces `publishConfig`.

6. **Automatic test runner detection**: `@sa11y/common` uses `process.env.JEST_WORKER_ID` and similar signals for environment detection. Changes here affect all packages.

7. **axe-core version pins**: Any change to the `axe-core` version in `packages/preset-rules` may silently change which violations `base`, `extended`, or `full` rulesets report. Always test the full matrix after an axe-core upgrade.
