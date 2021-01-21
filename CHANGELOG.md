# Changelog

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [0.6.0-beta](#060-beta)
    - [Features](#features)
- [0.5.0-beta (2020-12-01)](#050-beta-2020-12-01)
    - [Features](#features-1)
- [0.4.1-beta (2020-11-24)](#041-beta-2020-11-24)
    - [Bug Fixes](#bug-fixes)
- [0.4.0-beta (2020-10-31)](#040-beta-2020-10-31)
    - [Features](#features-2)
    - [Refactor](#refactor)
  - [0.3.2-beta (2020-09-22)](#032-beta-2020-09-22)
    - [Bug Fixes](#bug-fixes-1)
    - [Refactor](#refactor-1)
- [0.3.1-beta (2020-08-20)](#031-beta-2020-08-20)
    - [Refactor](#refactor-2)
- [0.3.0-beta (2020-08-19)](#030-beta-2020-08-19)
    - [Features](#features-3)
- [0.2.0-beta (2020-06-25)](#020-beta-2020-06-25)
    - [Features](#features-4)
    - [Bug Fixes](#bug-fixes-2)
    - [BREAKING CHANGES](#breaking-changes)
- [v0.1.0-alpha (2020-06-02)](#v010-alpha-2020-06-02)
    - [Features](#features-5)
- [(2020-05-29)](#2020-05-29)
    - [Features](#features-6)
- [(2020-05-07)](#2020-05-07)
    - [Bug Fixes](#bug-fixes-3)
    - [Features](#features-7)
- [(2020-04-07)](#2020-04-07)
    - [Bug Fixes](#bug-fixes-4)
    - [Features](#features-8)
- [(2020-03-20)](#2020-03-20)
    - [Bug Fixes](#bug-fixes-5)
    - [Features](#features-9)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# [0.6.0-beta] (2021-01-20)

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
