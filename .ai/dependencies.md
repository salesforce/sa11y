# Dependencies & Environment

## Runtime

- **Language**: TypeScript / JavaScript
- **Node.js**: `^20 || ^22 || ^24` (from `package.json` engines field)
- **Package manager**: Yarn v1 (classic) — `yarn.lock` committed

## System Dependencies

- Node.js (see version above)
- Yarn v1.22+ (`npm install -g yarn`)
- Chrome/Chromium required for integration tests (`yarn test:wdio`)
  - chromedriver version is pinned in `package.json` devDependencies

## Key Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | 4.9.5 | TypeScript compiler |
| `jest` | 28.x | Test runner for unit tests |
| `lerna` | 8.x | Monorepo versioning and publishing |
| `semantic-release` | 24.x | Automated release from conventional commits |
| `eslint` | 8.x | Linting |
| `prettier` | 2.x | Code formatting |
| `axe-core` | (per package) | Accessibility rule engine |

## Environment Variables

| Variable | Required | Purpose |
|----------|:--------:|---------|
| `SA11Y_AUTO` | No | Set to `1` to enable automatic per-test accessibility checks |
| `SA11Y_DEBUG` | No | Set to `1` to enable verbose debug logging |
| `NODE_AUTH_TOKEN` | CI only | npm publish token (set in GitHub Actions secrets) |
| `NPM_TOKEN` | CI only | Alternative npm publish token (semantic-release) |

## Private Registries

No private registry configuration detected. All dependencies are published to `registry.npmjs.org`.

Lock file integrity is validated in CI with `lockfile-lint` (allowed host: `registry.yarnpkg.com`).

## CI Environment

CI runs on GitHub Actions (`.github/workflows/nodejs.yml`):
- Matrix: Node 20, 22, 24 × Ubuntu latest
- Release job uses npm OIDC provenance publishing
