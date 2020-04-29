# Salesforce Accessibility Automation Libraries

Salesforce Accessibility Automated Testing Libraries and Tools (@sa11y packages).

![CI](https://github.com/salesforce/sa11y/workflows/CI/badge.svg)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Docs](#docs)
- [Packages](#packages)
  - [Preset accessibility rules](#preset-accessibility-rules)
  - [assertAccessible API](#assertaccessible-api)
  - [a11y results formatter](#a11y-results-formatter)
  - [Jest integration](#jest-integration)
  - [Test utilities](#test-utilities)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Docs

-   [Developer Guidelines](./CONTRIBUTING.md)
-   [Code of Conduct](./CODE_OF_CONDUCT.md)
-   [Changelog](./CHANGELOG.md)
-   [LICENSE](./LICENSE.txt)

## Packages

This repo contains the following packages

### [Preset accessibility rules](./packages/preset-rules/README.md)

-   Provides Recommended, Extended accessibility preset rule-sets as [axe](https://github.com/dequelabs/axe-core) configuration

### [assertAccessible API](./packages/assert/README.md)

-   checks current DOM for accessibility issues and throws an error when a11y issues are found

### [a11y results formatter](./packages/format/README.md)

-   format raw a11y issues JSON output from axe into an easy to consume format by consolidating and cross-referencing

### [Jest integration](./packages/jest/README.md)

-   provides a `toBeAccessible()` accessibility matcher for Jest integrating the [assertAccessible API](./packages/assert/README.md) with the [Jest assertion API](https://jestjs.io/docs/en/using-matchers)

### [Test utilities](./packages/test-utils/README.md)

-   Private package providing test utilities for `@sa11y` packages
