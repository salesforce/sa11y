# Salesforce Accessibility Automation Libraries

Automated Accessibility Testing Libraries and Tools ([@sa11y packages](https://www.npmjs.com/org/sa11y)) based on [axe-core][axe] providing support for [Jest](#jest-integration) unit tests, [WebdriverIO](#wdio-integration) component/integration tests used by teams in Salesforce. However, they are not specific to Salesforce and can be used to test any UI [supported by axe-core](https://github.com/dequelabs/axe-core#supported-browsers) for accessibility. These libraries are designed to be flexible, customizable and reusable to support automated accessibility testing in different testing workflows from unit to integration tests.

[![Build Status](https://circleci.com/gh/salesforce/sa11y.svg?style=svg)](https://app.circleci.com/pipelines/github/salesforce/sa11y?branch=master)
[![Code Coverage](https://codecov.io/gh/salesforce/sa11y/branch/master/graph/badge.svg)](https://codecov.io/gh/salesforce/sa11y)

<!-- Temp disabling code cov badge due to https://github.com/salesforce/sa11y/issues/14
     Re-enable with a code cov service that works with CircleCi -->
<!-- ![Code coverage](https://github.com/salesforce/sa11y/workflows/Code%20coverage/badge.svg) -->

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Docs](#docs)
  - [References](#references)
- [Packages](#packages)
  - [Jest integration](#jest-integration)
  - [WDIO integration](#wdio-integration)
  - [assertAccessible API](#assertaccessible-api)
  - [a11y results formatter](#a11y-results-formatter)
  - [Preset accessibility rules](#preset-accessibility-rules)
  - [Minified bundle for testing in browser](#minified-bundle-for-testing-in-browser)
  - [Internal packages](#internal-packages)
    - [Test utilities](#test-utilities)
    - [Integration Tests](#integration-tests)
    - [Common](#common)
  - [Dependency graph](#dependency-graph)
  - [Epilogue](#epilogue)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Docs

-   [Developer Guidelines](./CONTRIBUTING.md)
    -   Refer to [Quick start](./CONTRIBUTING.md#quick-start) instructions to get started, if you are a
        developer looking to Contribute
-   [Code of Conduct](./CODE_OF_CONDUCT.md)
-   [Changelog](./CHANGELOG.md)
-   [LICENSE](./LICENSE.txt)

### References

-   [Automated Accessibility Tests with sa11y | Developer Quick Takes - YouTube](https://www.youtube.com/watch?v=ScqZisOBbUM&list=PLgIMQe2PKPSJdFGHjGpjd1FbCsOqq5H8t&index=21)
-   [Automated Accessibility Testing with sa11y | Salesforce Developers Blog](https://developer.salesforce.com/blogs/2020/10/automated-accessibility-testing-with-sa11y.html)
-   [Get Started with Web Accessibility | Salesforce Trailhead](https://trailhead.salesforce.com/en/content/learn/trails/get-started-with-web-accessibility)
-   [Accessibility Overview - Lightning Design System](https://www.lightningdesignsystem.com/accessibility/overview/)
-   [LWC Accessibility guide](https://lwc.dev/guide/accessibility)

## Packages

This repo contains the following packages for automated accessibility testing:

### [Jest integration](./packages/jest/README.md)

-   Provides a `toBeAccessible()` accessibility matcher for Jest
    -   integrates the [assertAccessible API](./packages/assert/README.md) with the [Jest assertion API](https://jestjs.io/docs/en/using-matchers)
-   If you are looking to add accessibility testing to your Jest tests use this package

![Screenshot showing Sa11y Jest API usage and a11y errors showing up in VSCode](https://github.com/salesforce/sa11y/blob/media/screenshot/jest.png?raw=true)

### [WDIO integration](./packages/wdio/README.md)

-   Provides `assertAccessible()`, `assertAccessibleSync()` APIs that can be used with [WebdriverIO](https://webdriver.io/) to check accessibility of web pages rendered in browsers

![Screenshot showing a11y errors from a test using Sa11y WDIO in a terminal](https://github.com/salesforce/sa11y/blob/media/screenshot/wdio.png?raw=true)

### [assertAccessible API](./packages/assert/README.md)

-   Checks DOM or HTML Element for accessibility issues and throws an error if a11y issues are found
-   If you are looking to add accessibility testing to your Javascript unit tests and _not_ using Jest, use this package

### [a11y results formatter](./packages/format/README.md)

-   Formats raw JSON output of a11y issues from [axe] into an easy to consume format by consolidating and cross-referencing
-   Used by assert Accessible API and Jest a11y matcher
-   If you are using axe directly and want to format the results from `axe.run` use this package

### [Preset accessibility rules](./packages/preset-rules/README.md)

-   Provides Base, Recommended, Full accessibility preset rules as [axe] configuration
-   The Recommended preset rule is used by default in the Jest a11y matcher and assert Accessible APIs
    -   The APIs can be overridden to use the Base or Full ruleset as necessary

### [Minified bundle for testing in browser](./packages/browser-lib/README.md)

-   Provides a minified version of selected `@sa11y` libraries to be injected into a browser (using webdriver) and executed from integration testing workflows.

### Internal packages

#### [Test utilities](./packages/test-utils/README.md)

-   Private package providing test utilities for `@sa11y` packages

#### [Integration Tests](./packages/test-integration/README.md)

-   Private package providing integration tests for `@sa11y` packages

#### [Common](./packages/common/README.md)

-   Common utilities, constants, error messages for `@sa11y` packages

### Dependency graph

![Dependency graph of sa11y packages](docs/sa11y_dependency_graph.svg)

---

### Epilogue

A wise person once said…

<!-- cSpell:disable -->

_"Don't talk to me until I've had coffee and you've run axe"_

![Embroidery that says "Don't talk to me until I've had coffee and you've run axe" in a hoop](https://github.com/salesforce/sa11y/blob/media/axe_embroidery.jpeg?raw=true)

(Image courtesy: [@shleewhite](https://github.com/shleewhite), [@jorycunningham](https://github.com/jorycunningham))

<!-- cSpell:enable -->

[axe]: https://github.com/dequelabs/axe-core
