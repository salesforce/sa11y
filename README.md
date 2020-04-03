# Salesforce Accessibility Automation Libraries

Salesforce Accessibility Automated Testing Libraries and Tools (@sa11y packages).

![.github/workflows/ci.yml](https://github.com/salesforce/sa11y/workflows/.github/workflows/ci.yml/badge.svg)

-   [Salesforce Accessibility Automation Libraries](#salesforce-accessibility-automation-libraries)
    -   [Packages](#packages)
        -   [Preset Accessibility rules](#preset-accessibility-rules)
        -   [assertAccessible API (TBD)](#assertaccessible-api-tbd)
        -   [a11y results formatter (TBD)](#a11y-results-formatter-tbd)
        -   [Jest integration (TBD)](#jest-integration-tbd)

## Packages

This repo contains the following packages

### [Preset accessibility rules](./packages/preset-rules/README.md)

-   Provides Recommended, Extended accessibility preset rule-sets as [axe](https://github.com/dequelabs/axe-core) configuration

### [assertAccessible API](./packages/assert/README.md)

-   checks current DOM for accessibility issues and throws an error when a11y issues are found

### [a11y results formatter](./packages/format/README.md)

-   format raw a11y issues JSON output from axe into an easy to consume format by consolidating and cross-referencing

### Jest integration (TBD)

-   integrates the assertAccessible API with the [Jest assertion API](https://jestjs.io/docs/en/using-matchers)
