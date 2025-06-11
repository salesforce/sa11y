# `@sa11y/test-integration`

Private package for integration testing `@sa11y` packages across different environments and test runners.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Overview](#overview)
- [Test Coverage](#test-coverage)
- [Usage](#usage)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Overview

This package ensures that all `@sa11y` packages work correctly together and in different testing environments. It contains integration tests that verify cross-package compatibility and end-to-end functionality.

## Test Coverage

-   **Package Integration**: Tests interaction between packages like `@sa11y/jest`, `@sa11y/matcher`, and `@sa11y/format`
-   **Environment Compatibility**: Verifies functionality across different Node.js environments
-   **Test Runner Compatibility**: Ensures packages work correctly with different test runners
-   **API Consistency**: Validates that package APIs work as expected in real-world scenarios

## Usage

This is an internal package used by the Sa11y development team and CI/CD pipeline. It's not intended for external consumption.

```bash
# Run integration tests
yarn test

# Run specific test suites
yarn test --suite jest
yarn test --suite wdio
```
