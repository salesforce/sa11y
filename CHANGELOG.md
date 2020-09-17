# Changelog

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [0.4.0-beta (2020-09-18)](#040-beta-2020-09-18)
    - [Features 🌱](#features-)
    - [Documentation 📃](#documentation-)
    - [Chores 🧹](#chores-%F0%9F%A7%B9)
    - [Refactor ♻](#refactor-%E2%99%BB)
- [0.3.0-beta (2020-08-19)](#030-beta-2020-08-19)
    - [Features](#features)
- [0.2.0-beta (2020-06-25)](#020-beta-2020-06-25)
    - [Features](#features-1)
    - [Bug Fixes](#bug-fixes)
    - [BREAKING CHANGES](#breaking-changes)
- [v0.1.0-alpha (2020-06-02)](#v010-alpha-2020-06-02)
    - [Features](#features-2)
- [(2020-05-29)](#2020-05-29)
    - [Features](#features-3)
- [(2020-05-07)](#2020-05-07)
    - [Bug Fixes](#bug-fixes-1)
    - [Features](#features-4)
- [(2020-04-07)](#2020-04-07)
    - [Bug Fixes](#bug-fixes-2)
    - [Features](#features-5)
- [(2020-03-20)](#2020-03-20)
    - [Bug Fixes](#bug-fixes-3)
    - [Features](#features-6)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# 0.4.0-beta (2020-09-18)

### Features 🌱

-   **wdio:** add option to target specific elements from WDIO APIs ([#35](https://github.com/salesforce/sa11y/pull/35))

### Documentation 📃

-   add [SECURITY.md](./SECURITY.md) file to project
-   add badges for license, published npm versions, download stats

### Chores 🧹

-   update to the latest major release of axe v4 ([#34](https://github.com/salesforce/sa11y/pull/34))
-   add a post-merge git hook to run clean build (#35)
-   add lint script to ensure `version` property in `package.json` of changed packages are updated (#35)
-   bump version of packages as they hadn't been bumped since [0.2.0-beta](https://github.com/salesforce/sa11y/releases/tag/v0.2.0-beta) (#35)
-   update to next major release of [TypeScript 4.0](https://devblogs.microsoft.com/typescript/announcing-typescript-4-0/#whats-new) bringing increased build speeds and other improvements (#37)
-   update to next major release of [typescript-eslint/typescript-eslint](https://github.com/typescript-eslint/typescript-eslint/releases) containing several breaking changes (#37)
-   update to patch release of [axe-core 4.0.2](https://github.com/dequelabs/axe-core/releases/tag/v4.0.2) (#37)
-   update other dev deps to minor/patch releases
-   add a post-merge git hook to run clean build

### Refactor ♻

-   Fix code to take care of the new errors from the upgraded versions (#37)
    -   Silencing rules only as last resort esp. in non application code (test, config etc)
-   Fix how default options are processed for the formatter (#37)
-   Fix chained npm commands to depend on previous exit code (#37)
-   Reuse common typescript config for eslint (#37)

# [0.3.0-beta](https://github.com/salesforce/sa11y/tree/v0.3.0-beta) (2020-08-19)

### Features

-   **browser-lib:** add a new package for producing bundled minified version of sa11y ([#32](https://github.com/salesforce/sa11y/pull/32))

# [0.2.0-beta](https://github.com/salesforce/sa11y/releases/tag/v0.2.0-beta) (2020-06-25)

### Features

-   **wdio:** add assert accessible API for WDIO ([#21](https://github.com/salesforce/sa11y/pull/21))
-   **preset-rules:** add a full ruleset with all rules from axe ([#21](https://github.com/salesforce/sa11y/pull/21))

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
