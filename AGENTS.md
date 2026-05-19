# sa11y — Agent Orientation

Automated Accessibility Testing Libraries for Jest, Vitest, and WebdriverIO, built on axe-core.

## Package Architecture

```
axe-core → preset-rules → format → assert → matcher → jest / vitest / wdio
                                                     → browser-lib (browser bundle)
Internal: common (utilities), test-utils (fixtures), test-integration (e2e tests)
```

## Key Directories

| Directory | Purpose |
|-----------|---------|
| `packages/assert/src/` | Core `assertAccessible()` API |
| `packages/matcher/src/` | Shared `toBeAccessible()` matcher (Jest + Vitest) |
| `packages/jest/src/` | Jest integration: setup, automatic checks, results processors |
| `packages/vitest/src/` | Vitest integration |
| `packages/wdio/src/` | WebdriverIO integration |
| `packages/format/src/` | Result formatting, WCAG metadata, `A11yError` class |
| `packages/preset-rules/src/` | axe ruleset configs: base/extended/full |
| `packages/common/src/` | Shared helpers, env detection (private) |
| `packages/test-utils/src/` | DOM fixtures for tests (private) |
| `.github/workflows/` | CI: lint+build+test (Node 20/22/24) + semantic-release |

## Commands

```bash
yarn install          # Install dependencies
yarn build            # TypeScript build (all packages)
yarn build:watch      # Incremental build in watch mode
yarn test             # Run all unit tests (jest --coverage --runInBand)
yarn test:watch       # Tests in watch mode
yarn test packages/<name>  # Test a single package
yarn lint             # ESLint
yarn lint:fix         # ESLint auto-fix
```

## Commit Convention

Conventional commits required: `feat:`, `fix:`, `chore:`, `docs:`, etc.  
Use `yarn commit` for guided interactive commit.

## Key Patterns

- All public APIs are async and accept optional params with sensible defaults
- Use `@sa11y/test-utils` DOM fixtures in tests — no inline HTML
- Environment flags use `SA11Y_` prefix via `@sa11y/common` helpers
- Each package has `src/__tests__/*.spec.ts` tests

## Common Tasks

See `.ai/common-tasks.md` for step-by-step workflows (add a rule preset, debug tests, bump versions, etc.).

## Gotchas

- `yarn build` (not `tsc --build`) — runs TypeScript + browser-lib bundle
- `browser-lib` is a separate build step; must not use Node-only APIs
- `SA11Y_AUTO=1` enables automatic per-test a11y checks in Jest/Vitest
- axe-core version pins in `preset-rules` affect which violations are reported
