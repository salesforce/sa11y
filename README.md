# Salesforce Accessibility Automation Libraries

Salesforce Accessibility Automated Testing Libraries and Tools (@sa11y packages).

- [Salesforce Accessibility Automation Libraries](#salesforce-accessibility-automation-libraries)
  - [Packages](#packages)
    - [Preset Accessibility rules](#preset-accessibility-rules)
    - [assertAccessible API](#assertaccessible-api)
    - [Jest integration](#jest-integration)

## Packages
This repo contains the following packages

### Preset Accessibility rules
* provides Recommended, Extended accessibility preset rule sets as axe configuration

### assertAccessible API
* checks current DOM for accessibility issues and throws an error when a11y issues are found

### a11y results formatter
* format raw a11y issues JSON output from axe into an easy to consume format by consolidating and cross-referencing

### Jest integration
* integrates the [assertAccessible API](#assertaccessible-api) with the [Jest assertion API](https://jestjs.io/docs/en/using-matchers)
