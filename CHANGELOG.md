# Changelog

All notable changes to this project will be documented in this file.

## [4.0.0-alpha.3](https://github.com/salesforce/sa11y/compare/v4.0.0-alpha.2...v4.0.0-alpha.3) (2022-10-18)


### Bug Fixes

* **package.json:** declare engines supported ([c3a212f](https://github.com/salesforce/sa11y/commit/c3a212f8437b0b63435c7c427caa659340b7b951))

## [4.0.0-alpha.3](https://github.com/salesforce/sa11y/compare/v4.0.0-alpha.2...v4.0.0-alpha.3) (2022-10-18)


### Bug Fixes

* **package.json:** declare engines supported ([c3a212f](https://github.com/salesforce/sa11y/commit/c3a212f8437b0b63435c7c427caa659340b7b951))

## [4.0.0-alpha.2](https://github.com/salesforce/sa11y/compare/v4.0.0-alpha.1...v4.0.0-alpha.2) (2022-10-18)


### Bug Fixes

* **docs:** fix broken badge image in README.md ([e3efbaf](https://github.com/salesforce/sa11y/commit/e3efbafa56e2426ffacbdf7b8edee4176e7991ec))

## [4.0.0-alpha.1](https://github.com/salesforce/sa11y/compare/v3.1.0...v4.0.0-alpha.1) (2022-10-14)


### ⚠ BREAKING CHANGES

* `sa11y` will no longer support Node.js 12, which is EOL since 30 April 2022

### Features

* remove support for Node.js 12 ([#116](https://github.com/salesforce/sa11y/issues/116)) ([43ade48](https://github.com/salesforce/sa11y/commit/43ade489bfab5d2c407b256117269475a3571fb7))
* semantic-release ([18d2728](https://github.com/salesforce/sa11y/commit/18d2728c80da8a79792914727d74c57b0ed417b3))
* tsconfig package for tsconfig.json ([#174](https://github.com/salesforce/sa11y/issues/174)) ([5ff2fd2](https://github.com/salesforce/sa11y/commit/5ff2fd20ef6671cb7eae579bcf6aeaf45f4b0c54))
* webdriver7 ([#150](https://github.com/salesforce/sa11y/issues/150)) ([70dafc2](https://github.com/salesforce/sa11y/commit/70dafc2b376e754916c3814299148516a4c71037))

# Changelog

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [3.1.0 (2021-11-18)](#310-2021-11-18)
    - [Bug Fixes](#bug-fixes)
- [3.0.2 (2021-11-02)](#302-2021-11-02)
    - [Reverts](#reverts)
- [3.0.1 (2021-10-21)](#301-2021-10-21)
    - [Refactor](#refactor)
- [3.0.0 (2021-09-16)](#300-2021-09-16)
- [0.11.2-beta (2021-09-13)](#0112-beta-2021-09-13)
  - [WDIO](#wdio)
- [0.11.1-beta (2021-09-10)](#0111-beta-2021-09-10)
    - [Automatic checks](#automatic-checks)
    - [Results processor](#results-processor)
    - [WDIO](#wdio-1)
- [0.11.0-beta (2021-08-26)](#0110-beta-2021-08-26)
    - [BREAKING CHANGES ⚠️](#breaking-changes-)
    - [Features](#features)
- [0.10.0-beta (2021-08-04)](#0100-beta-2021-08-04)
    - [Features](#features-1)
- [0.9.1-beta (2021-07-05)](#091-beta-2021-07-05)
    - [Fix](#fix)
- [0.9.0-beta (2021-06-15)](#090-beta-2021-06-15)
    - [Features](#features-2)
- [0.8.0-beta (2021-03-19)](#080-beta-2021-03-19)
    - [Features](#features-3)
    - [BREAKING CHANGES](#breaking-changes)
    - [Refactor](#refactor-1)
- [0.7.0-beta (2021-02-24)](#070-beta-2021-02-24)
    - [Features](#features-4)
- [0.6.0-beta (2021-01-22)](#060-beta-2021-01-22)
    - [Features](#features-5)
- [0.5.0-beta (2020-12-01)](#050-beta-2020-12-01)
    - [Features](#features-6)
- [0.4.1-beta (2020-11-24)](#041-beta-2020-11-24)
    - [Bug Fixes](#bug-fixes-1)
- [0.4.0-beta (2020-10-31)](#040-beta-2020-10-31)
    - [Features](#features-7)
    - [Refactor](#refactor-2)
  - [0.3.2-beta (2020-09-22)](#032-beta-2020-09-22)
    - [Bug Fixes](#bug-fixes-2)
    - [Refactor](#refactor-3)
- [0.3.1-beta (2020-08-20)](#031-beta-2020-08-20)
    - [Refactor](#refactor-4)
- [0.3.0-beta (2020-08-19)](#030-beta-2020-08-19)
    - [Features](#features-8)
- [0.2.0-beta (2020-06-25)](#020-beta-2020-06-25)
    - [Features](#features-9)
    - [Bug Fixes](#bug-fixes-3)
    - [BREAKING CHANGES](#breaking-changes-1)
- [v0.1.0-alpha (2020-06-02)](#v010-alpha-2020-06-02)
    - [Features](#features-10)
- [(2020-05-29)](#2020-05-29)
    - [Features](#features-11)
- [(2020-05-07)](#2020-05-07)
    - [Bug Fixes](#bug-fixes-4)
    - [Features](#features-12)
- [(2020-04-07)](#2020-04-07)
    - [Bug Fixes](#bug-fixes-5)
    - [Features](#features-13)
- [(2020-03-20)](#2020-03-20)
    - [Bug Fixes](#bug-fixes-6)
    - [Features](#features-14)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# 3.1.0 (2021-11-18)

### Bug Fixes

-   automatic checks file filter to be exclusion only to keep it simple
-   add sa11y common pkg as dep instead of dev dep

# [3.0.2](https://github.com/salesforce/sa11y/releases/tag/v3.0.2) (2021-11-02)

### Reverts

-   filtering of non-a11y results introduced in 3.0.1
    -   as it is causing issues with certain CI workflows that produce no test results file

# [3.0.1](https://github.com/salesforce/sa11y/releases/tag/v3.0.1) (2021-10-21)

### Refactor

-   exclude descendancy rules from Jest API
    -   these are rules that might fail at unit/component level but might pass at page level
-   change sa11y results processor to output only a11y failures

# [3.0.0](https://github.com/salesforce/sa11y/releases/tag/v3.0.0) (2021-09-16)

-   Moving to unified versioning of @sa11y packages instead of independent versioning for reducing complexity of managing independent versions
-   No code changes, No breaking changes

# [0.11.2-beta](https://github.com/salesforce/sa11y/releases/tag/v0.11.2-beta) (2021-09-13)

## WDIO

-   Fix: Replace custom polling logic to use [WebdriverIO's wait util](https://webdriver.io/docs/api/browser/waitUntil/) instead as it reliably fixes the race condition

# [0.11.1-beta](https://github.com/salesforce/sa11y/releases/tag/v0.11.1-beta) (2021-09-10)

### Automatic checks

-   Add ability and convenience shortcut for excluding files from automatic checks ([#74](https://github.com/salesforce/sa11y/pull/74))

### Results processor

-   Move the WCAG metadata and Priority info to class name in Jest results so that downstream CI systems make use of the info accordingly
    -   Remove WCAG version, Level for brevity
-   Error msgs: Move help URL up in order to prevent it from getting truncated e.g. when CSS selectors are long

### WDIO

-   Fix race condition when loading axe using poll with timeout

# [0.11.0-beta](https://github.com/salesforce/sa11y/releases/tag/v0.11.0-beta) (2021-08-26)

### BREAKING CHANGES ⚠️

-   Refactor rulesets into `base`, `extended` ([#73](https://github.com/salesforce/sa11y/pull/73))
    -   with `extended` replacing `recommended`
    -   `base` contains WCAG 2.1 AA rules available in axe-core
    -   `extended` contains AAA rules, experimental rules and non-WCAG best practice rules
    -   These ruleset changes could result in different test results from previous versions

### Features

-   Add priority and WCAG Success Criteria metadata to preset-rules
-   Add config to run rules selectively by priority
-   Add script to generate preset rules markdown table in Readme with provided rules metadata

# [0.10.0-beta](https://github.com/salesforce/sa11y/releases/tag/v0.10.0-beta) (2021-08-04)

### Features

-   **jest:** add config to run automatic checks only on selected files
-   **preset-rules:** add config to override default ruleset using environment variable

# [0.9.1-beta](https://github.com/salesforce/sa11y/releases/tag/v0.9.1-beta) (2021-07-05)

### Fix

-   **jest(result processor):** move WCAG metadata from suite name to test name ([#69](https://github.com/salesforce/sa11y/pull/69))
-   **jest:** add workaround for mock timer timeout issue for API and automatic checks ([#69](https://github.com/salesforce/sa11y/pull/69))
-   **build:** move webdriverIO to dev dependency in sa11y common pkg ([#68](https://github.com/salesforce/sa11y/pull/68))

# [0.9.0-beta](https://github.com/salesforce/sa11y/releases/tag/v0.9.0-beta) (2021-06-15)

### Features

-   **jest:** de-duplicate a11y failures for automatic checks ([#61](https://github.com/salesforce/sa11y/issues/61))
-   **jest:** add a custom test results processor ([#62](https://github.com/salesforce/sa11y/pull/62))
    -   create a new test suite to hold a11y errors
    -   add wcag metadata to results output
    -   transform a11y error details into suite, test names

# [0.8.0-beta](https://github.com/salesforce/sa11y/releases/tag/v0.8.0-beta) (2021-03-19)

### Features

-   **browser-lib:** add support for selecting specific css selector to check for a11y
-   **wdio:** add scope to target only given css selector for a11y checks
    -   add custom browser commands for the sa11y APIs

### BREAKING CHANGES

-   `@sa11y/wdio` APIs take an `WdioOptions` object instead of individual parameters (Webdriver, ExceptionList)

### Refactor

-   refactor(test-integration): to use wdio runner rather than jest
-   refactor(test-utils): remove obsolete wdio jest bridge utils
-   test(wdio): refactor to common func to check a11y error
-   refactor: extract common types, interfaces into common package
-   build: update to axe v4.1.3
-   chore: update run script for husky v6

# [0.7.0-beta](https://github.com/salesforce/sa11y/releases/tag/v0.7.0-beta) (2021-02-24)

### Features

-   **jest:** add opts to invoke checks automatically after each test ([#54](https://github.com/salesforce/sa11y/pull/54))
-   Update axe-core to 4.1.2 ([#54](https://github.com/salesforce/sa11y/pull/54))

# [0.6.0-beta](https://github.com/salesforce/sa11y/releases/tag/v0.6.0-beta) (2021-01-22)

### Features

-   **wdio:** add exception list opt to wdio APIs ([#51](https://github.com/salesforce/sa11y/pull/51))
-   **typescript:** include d.ts TypeScript definitions in packages ([#52](https://github.com/salesforce/sa11y/pull/52))

# [0.5.0-beta](https://github.com/salesforce/sa11y/releases/tag/v0.5.0-beta) (2020-12-01)

### Features

-   **preset-rules:** add new rules from axe v4.1.1

# [0.4.1-beta](https://github.com/salesforce/sa11y/releases/tag/v0.4.1-beta) (2020-11-24)

### Bug Fixes

-   Upgrade to axe v4.1.1 which include bug fixes from [v4.1.0](https://github.com/dequelabs/axe-core/releases/tag/v4.1.0) and [v4.1.1](https://github.com/dequelabs/axe-core/releases/tag/v4.1.1) ([#46](https://github.com/salesforce/sa11y/pull/46))

# [0.4.0-beta](https://github.com/salesforce/sa11y/releases/tag/v0.4.0-beta) (2020-10-31)

### Features

-   **browser-lib:** add wrapper func to check a11y with opt to filter violations
-   **format:** add an exception list filter to filter a11y violations

### Refactor

-   test(wdio): refactor to extract wdio standalone setup, teardown
-   refactor(common): create type alias for axe results for reuse

## [0.3.2-beta](https://github.com/salesforce/sa11y/releases/tag/v0.3.2-beta) (2020-09-22)

### Bug Fixes

-   **preset-rules:** disable preloading media in axe config to fix timeout ([#41](https://github.com/salesforce/sa11y/pull/41))

### Refactor

-   chore: update typescript and typescript/eslint plugin to v4 ([#37](https://github.com/salesforce/sa11y/pull/37))

# [0.3.1-beta](https://github.com/salesforce/sa11y/releases/tag/v0.3.1-beta) (2020-08-20)

### Refactor

-   chore: update to the latest major release of axe

# [0.3.0-beta](https://github.com/salesforce/sa11y/tree/v0.3.0-beta) (2020-08-19)

### Features

-   **browser-lib:** add a new package for producing bundled minified version of sa11y ([#32](https://github.com/salesforce/sa11y/pull/32))

# [0.2.0-beta](https://github.com/salesforce/sa11y/releases/tag/v0.2.0-beta) (2020-06-25)

### Features

-   **wdio:** add assert accessible API for WDIO ([#21](https://github.com/salesforce/sa11y/pull/21))

*   **preset-rules:** add a full ruleset with all rules from axe ([#21](https://github.com/salesforce/sa11y/pull/21))

### Bug Fixes

-   **format:** fix a11y error message to use formatted output ([#21](https://github.com/salesforce/sa11y/pull/21))
-   **format:** check explicitly for undefined to allow custom formatter ([#21](https://github.com/salesforce/sa11y/pull/21))
-   **jest:** fix a11y error being undefined when used with not matcher ([#21](https://github.com/salesforce/sa11y/pull/21)), closes [#18](https://github.com/salesforce/sa11y/issues/18)

### BREAKING CHANGES

-   **preset-rules:** align name and behavior to follow common naming conventions in terms of preset configs ([#21](https://github.com/salesforce/sa11y/pull/21))
    -   rename `extended` ruleset to `recommended`
        -   it continues to be the default and recommended
    -   rename `recommended` preset rule to `base`
    -   If you are not using the preset-rules explicitly in the APIs, this change will not affect you
    -   But if you are using the preset-rules explicitly in your APIs, you will have to change them
        -   If you are using the `recommended` preset-rule rename it to `base`
        -   If you are using the `extended` preset-rule rename it to `recommended`

# [v0.1.0-alpha](https://github.com/salesforce/sa11y/releases/tag/v0.1.0-alpha) (2020-06-02)

### Features

-   **format:** add num of issues, unicode chars, jest matcher helper ([#13](https://github.com/salesforce/sa11y/pull/13))
-   **format:** sort a11y issues by impact ([#13](https://github.com/salesforce/sa11y/pull/13))

# (2020-05-29)

### Features

-   **jest:** add jest accessibility matcher ([#9](https://github.com/salesforce/sa11y/issues/9))

# (2020-05-07)

### Bug Fixes

-   **preset-rules:** revert object freeze on a11y config object

### Features

-   **assert:** add assert accessible api ([#7](https://github.com/salesforce/sa11y/issues/7))
-   **jest:** add basic scaffolding for jest integration
-   **jest:** add scaffolding for jest expect matcher
-   **jest:** add toBeAccessibleWith jest a11y matcher for use with config
-   **test-utils:** add a test utilities package

# (2020-04-07)

### Bug Fixes

-   **assert:** fix stale import of a11y config
-   **rules:** fix import paths of modules in rules package

### Features

-   **assert:** add scaffolding for assert package
-   **format:** add basic scaffolding for format package

# (2020-03-20)

### Bug Fixes

-   **rules:** add missed out rule label-content-name-mismatch

### Features

-   **ruleset:** add recommended, extended rulesets ([#3](https://github.com/salesforce/sa11y/pull/3))
