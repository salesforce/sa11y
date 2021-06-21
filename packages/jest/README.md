# `@sa11y/jest`

Accessibility matcher for [Jest](https://jestjs.io)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Overview](#overview)
- [Install](#install)
- [Setup](#setup)
  - [Project level](#project-level)
  - [Test module level](#test-module-level)
  - [Automatic checks](#automatic-checks)
    - [Using environment variables](#using-environment-variables)
    - [Sa11y results processor](#sa11y-results-processor)
      - [JSON result transformation](#json-result-transformation)
    - [Limitations](#limitations)
- [Caution](#caution)
- [Usage](#usage)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Overview

The `toBeAccessible()` API from this library can be used in Jest unit tests to test HTML elements or DOM for accessibility.

[![Watch Automated Accessibility Tests with sa11y | Developer Quick Takes](https://img.youtube.com/vi/ScqZisOBbUM/0.jpg)](https://www.youtube.com/watch?v=ScqZisOBbUM&list=PLgIMQe2PKPSJdFGHjGpjd1FbCsOqq5H8t&index=21)

![Screenshot showing Sa11y Jest API usage and a11y errors showing up in VSCode](https://github.com/salesforce/sa11y/blob/media/screenshot/jest.png?raw=true)

## Install

-   Using yarn: `yarn add -D @sa11y/jest`
-   Using npm: `npm install -D @sa11y/jest`

## Setup

The accessibility APIs need to be registered with Jest before they can be used in tests.

### Project level

You can set up the sa11y API once at the project level to make it available to all the Jest tests in the project. For an example look at the [Integration test setup in @sa11y](../test-integration/README.md).

-   Add a Jest setup file (e.g. `jest-setup.js`) and add the following code that registers the sa11y API

```javascript
// Import using either CommonJS `require` or ES6 `import`
const { setup } = require('@sa11y/jest'); // CommonJS
import { setup } from '@sa11y/jest'; // ES6
// Register the sa11y matcher
setup();
```

-   Add or Modify the Jest config at project root to invoke the Jest setup file as setup above.
-   In the `jest.config.js` at the root of your project, add:

```javascript
module.exports = {
    setupFilesAfterEnv: ['<rootDir>/sa11y-jest-setup.js'],
};
```

-   If the project already has jest configs, they can be merged e.g.

```javascript
const { jestConfig } = require('@salesforce/sfdx-lwc-jest/config');

const setupFilesAfterEnv = jestConfig.setupFilesAfterEnv || [];
setupFilesAfterEnv.push('<rootDir>/jest-sa11y-setup.js');

module.exports = {
    ...jestConfig,
    setupFilesAfterEnv,
};
```

-   This makes the `toBeAccessible` API available for any test in the project.

### Test module level

Invoke `setup` before using the `toBeAccessible` API in the tests

```javascript
import { setup } from '@sa11y/jest';

beforeAll(() => {
    setup();
});
```

-   This makes the `toBeAccessible` API available for the tests only in that specific test module where `setup()` is invoked.

### Automatic checks

The sa11y API can be setup to be automatically invoked at the end of each test as an alternative to adding the `toBeAccessible` API at the end of each test.

-   When automatic checks are enabled each child element in the DOM body will be checked for a11y and failures reported as part of the test.

```javascript
setup({ autoCheckOpts: { runAfterEach: true } });

// To optionally cleanup the body after running a11y checks
setup({ autoCheckOpts: { runAfterEach: true, cleanupAfterEach: true } });
```

#### Using environment variables

Automatic checks can also be enabled using environment variables

```shell
SA11Y_AUTO=1 SA11Y_CLEANUP=1 jest
```

-   Invoking `jest` with environment variables as above will enable automatic checks with no changes required to `setup()`
-   The environment variables can be used to set up parallel builds e.g., in a CI environment without code changes to `setup()` to opt-in to automatic checks

#### Sa11y results processor

The sa11y custom test results processor can be enabled using e.g., - `jest --json --outputFile results.json --testResultsProcessor node_modules/@sa11y/jest/dist/resultsProcessor.js`

-   sa11y results processor affects only the JSON result output
    -   It does not affect the default console reporter or output of any other reporter (e.g., HTML reporter)
-   a11y errors within a single test file will be de-duped by rule ID and CSS selectors
-   a11y errors will be transformed into their own test failures
    -   This would extract the a11y errors from the original tests and create additional test failures with the WCAG version, level, rule ID, CSS selectors as key
        -   bringing a11y metadata to forefront instead of being part of stacktrace
    -   The JSON output can be transformed into JUnit XML format e.g., using [jest-junit](https://github.com/jest-community/jest-junit)

##### JSON result transformation

With default results processor - a11y error is embedded within the test failure:

```json
"assertionResults": [
  {
    "ancestorTitles": [
      "integration test @sa11y/jest"
    ],
    "failureMessages": [
      "A11yError: 1 Accessibility issues found\n * (link-name) Links must have discernible text: a\n\t- Help URL: https://dequeuniversity.com/rules/axe/4.1/link-name\n    at Function.checkAndThrow (packages/format/src/format.ts:67:19)\n    at automaticCheck (packages/jest/src/automatic.ts:54:19)\n    at Object.<anonymous> (packages/jest/src/automatic.ts:69:13)"
    ],
    "fullName": "integration test @sa11y/jest should throw error for inaccessible dom",
    "location": null,
    "status": "failed",
    "title": "should throw error for inaccessible dom"
  }
]
```

With sa11y results processor:

-   Original JSON test result (failure with embedded a11y error) is disabled

```json
"assertionResults": [
{
"ancestorTitles": [
"integration test @sa11y/jest"
],
"failureMessages": [
"A11yError: 1 Accessibility issues found\n * (link-name) Links must have discernible text: a\n\t- Help URL: https://dequeuniversity.com/rules/axe/4.1/link-name\n    at Function.checkAndThrow (packages/format/src/format.ts:67:19)\n    at automaticCheck (packages/jest/src/automatic.ts:54:19)\n    at Object.<anonymous> (packages/jest/src/automatic.ts:69:13)"
],
"fullName": "integration test @sa11y/jest should throw error for inaccessible dom",
"location": null,
"status": "disabled",
"title": "should throw error for inaccessible dom"
},
]
```

-   Each unique a11y failure in a test module is extracted as a new test failure and added to a new test suite using a11y metadata as key. This could result in increase of total test count and suite count in the results JSON.

```json
"assertionResults": [
  {
    "ancestorTitles": [
      "integration test @sa11y/jest",
      "integration test @sa11y/jest should throw error for inaccessible dom"
    ],
    "failureMessages": [
      "Accessibility issues found: Links must have discernible text\nCSS Selectors: a\nHTML element: <a href=\"#\"></a>\nHelp: https://dequeuniversity.com/rules/axe/4.1/link-name\nTests: \"integration test @sa11y/jest should throw error for inaccessible dom\"\nSummary: Fix all of the following:\n  Element is in tab order and does not have accessible text\n\nFix any of the following:\n  Element does not have text that is visible to screen readers\n  aria-label attribute does not exist or is empty\n  aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty\n  Element has no title attribute"
    ],
    "fullName": "Links must have discernible text: a",
    "location": null,
    "status": "failed",
    "title": "should throw error for inaccessible dom"
  }
],
```

#### Limitations

Automatic checks currently has the following limitations.

-   Automatic check is triggered regardless of the test status which would result in the original test failure if any getting overwritten by a11y failures if any from automatic checks ([#66](https://github.com/salesforce/sa11y/issues/66))
-   Tests using the sa11y jest api would get tested twice with automatic checks - once as part of the sa11y API in the test and again as part of the automatic check
    -   a11y issues from automatic checks would overwrite the a11y issues found by the API
    -   If the sa11y API has been added to the test to check specific intermediate states of the DOM, enabling automatic checks could result in missed a11y issues
-   Automatic checks check the DOM state as it is at the end of the test. DOM states before the end of the test are not checked which could result in missed a11y issues.
-   If the test cleans up the DOM after execution, as part of teardown e.g., the sa11y automatic check executed at the end of the test would not be able to check the DOM
    -   Workaround: Remove the DOM cleanup code from the test and opt-in to using sa11y to clean-up the DOM using the options as described above (`cleanupAfterEach: true` or `SA11Y_CLEANUP=1`)
-   With the sa11y results processor
    -   Though the originating test from which the a11y failures are extracted is disabled, and test counts adjusted accordingly - the original test suite failure message still contains the a11y failures.
        -   The test suite failure message is typically not displayed or used in testing workflows. But if your testing workflow uses the test suite failure message, this might cause confusion.

## Caution

-   **async**: `toBeAccessible` **must** be invoked with `async/wait` or `Promise` or the equivalent supported asynchronous method in your environment
    -   Not invoking it async would result in incorrect results e.g. no issues reported even when the page is not accessible
    -   `Promise` should not be mixed together with `async/wait`. Doing so could result in Jest timeout and other errors.
-   **DOM**: 💡 The accessibility checks _cannot_ be run on static HTML markup. They can only be run against a rendered DOM.
-   **color-contrast**: 🍭 Color-contrast check is disabled for Jest tests as it [does not work in JSDOM](https://github.com/dequelabs/axe-core/issues/595)
-   **audio, video**: 📹 Accessibility of `audio`, `video` elements cannot be checked with Jest as they are [stubbed out in JSDOM](https://github.com/jsdom/jsdom/issues/2155)
-   **template**: [`<template>` elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template) are not rendered in DOM and hence cannot be checked directly without rendering. They have to be rendered before they can be checked.
-   **real browser**: If you need to check for color-contrast, audio/video elements or any other checks which need the element to be rendered visually please use a real browser to test e.g. using [`@sa11y/wdio`](https://github.com/salesforce/sa11y/tree/master/packages/wdio#readme)

## Usage

-   `toBeAccessible` can either be invoked on the entire `document` (JSDOM) or on a specific HTML element to check for accessibility

```javascript
import { base, full } from '@sa11y/preset-rules';
import { setup } from '@sa11y/jest';

beforeAll(() => {
    setup();
});

it('should be accessible', async () => {
    // Setup DOM to be tested for accessibility
    //...

    // assert that DOM is accessible (using recommended preset-rule)
    await expect(document).toBeAccessible();

    // Can be used to test accessibility of a specific HTML element
    const elem = document.getElementById('foo');
    await expect(elem).toBeAccessible();

    // If you want to test against all rules provided by axe
    await expect(document).toBeAccessible(full);

    // If you have any a11y issues from the default recommended preset-rule
    //  that you can't fix for now, you can use the base preset-rule
    await expect(document).toBeAccessible(base);
});
```
