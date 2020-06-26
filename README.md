# Salesforce Accessibility Automation Libraries

Salesforce Accessibility Automated Testing Libraries and Tools (@sa11y packages).

[![Build](https://circleci.com/gh/salesforce/sa11y.svg?style=svg&circle-token=0e28763afb8e2d0f1293f08a112e8b5e387b324a)](https://app.circleci.com/pipelines/github/salesforce/sa11y?branch=master)

<!-- Temp disabling code cov badge due to https://github.com/salesforce/sa11y/issues/14
     Re-enable with a code cov service that works with CircleCi -->
<!-- ![Code coverage](https://github.com/salesforce/sa11y/workflows/Code%20coverage/badge.svg) -->

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Docs](#docs)
- [Packages](#packages)
  - [Jest integration](#jest-integration)
  - [WDIO integration](#wdio-integration)
  - [assertAccessible API](#assertaccessible-api)
  - [a11y results formatter](#a11y-results-formatter)
  - [Preset accessibility rules](#preset-accessibility-rules)
  - [Internal packages](#internal-packages)
    - [Test utilities](#test-utilities)
    - [Integration Tests](#integration-tests)
    - [Common](#common)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Docs

-   [Developer Guidelines](./CONTRIBUTING.md)
    -   Refer to [Quick start](./CONTRIBUTING.md#quick-start) instructions to get started, if you are a
        developer looking to Contribute
-   [Code of Conduct](./CODE_OF_CONDUCT.md)
-   [Changelog](./CHANGELOG.md)
-   [LICENSE](./LICENSE.txt)

## Packages

This repo contains the following packages

### [Jest integration](./packages/jest/README.md)

-   Provides a `toBeAccessible()` accessibility matcher for Jest
    -   integrates the [assertAccessible API](./packages/assert/README.md) with the [Jest assertion API](https://jestjs.io/docs/en/using-matchers)
-   If you are looking to add accessibility testing to your Jest tests use this package

### [WDIO integration](./packages/wdio/README.MD)

-   Provides a `assertAccessible()` API that can be used with [WebdriverIO](https://webdriver.io/) to check accessibility of web pages rendered in browsers

### [assertAccessible API](./packages/assert/README.md)

-   Checks DOM or HTML Element for accessibility issues and throws an error if a11y issues are found
-   If you are looking to add accessibility testing to your Javascript unit tests and _not_ using Jest, use this package

### [a11y results formatter](./packages/format/README.md)

-   Formats raw JSON output of a11y issues from axe into an easy to consume format by consolidating and cross-referencing
-   Used by assert Accessible API and Jest a11y matcher
-   If you are using axe directly and want to format the results from `axe.run` use this package

### [Preset accessibility rules](./packages/preset-rules/README.md)

-   Provides Base, Recommended accessibility preset rules as [axe](https://github.com/dequelabs/axe-core) configuration
-   The Recommended preset rule is used by default in the Jest a11y matcher and assert Accessible APIs
    -   The APIs can be overridden to use the Base ruleset if necessary

### Internal packages

#### [Test utilities](./packages/test-utils/README.md)

-   Private package providing test utilities for `@sa11y` packages

#### [Integration Tests](packages/test-integration/README.md)

-   Private package providing integration tests for `@sa11y` packages

#### [Common](packages/common/README.md)

-   Common utilities, constants, error messages for `@sa11y` packages
