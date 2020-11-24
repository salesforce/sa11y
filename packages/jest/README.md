# `@sa11y/jest`

Accessibility matcher for [Jest](https://jestjs.io)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Overview](#overview)
- [Install](#install)
- [Setup](#setup)
  - [Project level](#project-level)
  - [Test module level](#test-module-level)
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

You can set up the a11y API once at the project level to make it available to all the Jest tests in the project. For an example look at the [Integration test setup in @sa11y](../test-integration/README.md).

-   Add a Jest setup file (e.g. `jest-setup.js`) and add the following code that registers the a11y API

```javascript
// Import using either CommonJS `require` or ES6 `import`
const { registerSa11yMatcher } = require('@sa11y/jest'); // CommonJS
import { registerSa11yMatcher } from '@sa11y/jest'; // ES6
// Register the sa11y matcher
registerSa11yMatcher();
```

-   Add or Modify the Jest config at project root to invoke the Jest setup file as setup above.
    In the `jest.config.js` at the root of your project, add:

```javascript
module.exports = {
    setupFilesAfterEnv: ['<rootDir>/jest-setup.js'],
};
```

-   This makes the `toBeAccessible` API available for any test in the project.

### Test module level

Invoke `registerSa11yMatcher` before using the `toBeAccessible` API in the tests

```javascript
import { registerSa11yMatcher } from '@sa11y/jest';

beforeAll(() => {
    registerSa11yMatcher();
});
```

-   This makes the `toBeAccessible` API available for the tests only in that specific test module where `registerSa11yMatcher()` is invoked.

## Caution

-   **async**: `toBeAccessible` **must** be invoked with `async/wait` or `Promise` or the equivalent supported asynchronous method in your environment
    -   Not invoking it async would result in incorrect results e.g. no issues reported even when the page is not accessible
-   **color-contrast**: Color-contrast check is disabled for Jest tests as it [does not work in JSDOM](https://github.com/dequelabs/axe-core/issues/595)
-   **audio, video**: Accessibility of `audio`, `video` elements cannot be checked with Jest as they are [stubbed out in JSDOM](https://github.com/jsdom/jsdom/issues/2155)
-   **real browser**: If you need to check for color-contrast, audio/video elements or any other checks which need the element to be rendered visually please use a real browser to test e.g. using [`@sa11y/wdio`](https://github.com/salesforce/sa11y/tree/master/packages/wdio#readme)

## Usage

-   `toBeAccessible` can either be invoked on the entire `document` (JSDOM) or on a specific HTML element to check for accessibility

```javascript
import { base, full } from '@sa11y/preset-rules';
import { registerSa11yMatcher } from '@sa11y/jest';

beforeAll(() => {
    registerSa11yMatcher();
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
