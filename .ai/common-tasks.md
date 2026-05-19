# Common Tasks

For full build/test/commit commands, see [CONTRIBUTING.md](../CONTRIBUTING.md). This file covers task-to-file navigation and workflows not covered there.

## Add a New Accessibility Rule Preset

1. Edit `packages/preset-rules/src/` — add a new config file (follow the pattern in `base.ts`, `extended.ts`, `full.ts`)
2. Export it from `packages/preset-rules/src/index.ts`
3. Add WCAG metadata in `packages/preset-rules/src/wcag.ts` if the rule maps to a new WCAG criterion
4. Add tests in `packages/preset-rules/src/__tests__/`
5. Run `yarn test packages/preset-rules` to verify

## Add a New axe Custom Rule

1. Add the rule definition under `packages/preset-rules/src/custom-rules/`
2. Register it in `packages/preset-rules/src/rules.ts`
3. Add fixtures (HTML with/without the issue) in `packages/test-utils/src/`
4. Add tests in `packages/preset-rules/src/__tests__/`

## Add a Test Fixture (DOM with/without a11y issues)

1. Add HTML fixtures to `packages/test-utils/src/` (follow existing naming conventions)
2. Export from `packages/test-utils/src/index.ts`
3. Use in any `@sa11y/*` package tests via the internal `@sa11y/test-utils` dependency

## Add a Feature to the Jest Integration

1. Edit relevant file in `packages/jest/src/`:
   - `index.ts` — public API entry point
   - `automatic.ts` — automatic per-test checks
   - `matcher.ts` — `toBeAccessible()` delegation
   - `resultsProcessor.ts` — custom Jest results processors
   - `setup.ts` — Jest environment setup
2. Add tests in `packages/jest/src/__tests__/`
3. Run `yarn test packages/jest`

## Add a Feature to the Vitest Integration

1. Edit `packages/vitest/src/` — mirrors the Jest integration structure
2. Tests live in `packages/vitest/src/__tests__/`
3. Run `yarn test packages/vitest`

## Debug a Failing Test

1. Insert `debugger` statement at the failure point
2. Run: `yarn test:debug packages/<pkg>/src/__tests__/<file>.spec.ts`
3. Open Chrome → `chrome://inspect` → Open dedicated DevTools for Node

## Run a Single Package's Tests

```bash
yarn test packages/<package-name>
```

## Run Tests in Watch Mode

```bash
yarn test:watch
```

## Bump Package Versions

```bash
# Preview version bumps (conventional commits drive version):
yarn release:version

# Publish from tagged packages:
yarn release:publish
```

## Update the Changelog

```bash
yarn release:changelog
```

## Build the Browser Library Bundle

```bash
yarn workspace @sa11y/browser-lib build
# Or from root (builds everything including browser-lib):
yarn build
```
