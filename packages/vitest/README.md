<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [`@sa11y/vitest`](#sa11yvitest)
  - [Overview](#overview)
  - [Install](#install)
  - [Setup](#setup)
    - [Project level](#project-level)
    - [Test module level](#test-module-level)
  - [Usage](#usage)
    - [Caveats](#caveats)
  - [Automatic checks](#automatic-checks)
      - [Options](#options)
  - [Results Processor](#results-processor)
  - [Related Packages](#related-packages)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# `@sa11y/vitest`

Accessibility matcher for [Vitest](https://vitest.dev/)

## Overview

The `toBeAccessible()` API from this library can be used in Vitest unit tests to test HTML elements or DOM for accessibility.

> **Note:** The core accessibility logic is provided by [`@sa11y/matcher`](../matcher/README.md), which can be used directly for custom or framework-agnostic testing.

## Install

-   Using yarn: `yarn add -D @sa11y/vitest`
-   Using npm: `npm install -D @sa11y/vitest`

## Setup

The accessibility APIs need to be registered with Vitest before they can be used in tests.

### Project level

You can set up the Sa11y API once at the project level to make it available to all the Vitest tests in the project.

-   Add a Vitest setup file (e.g. `vitest-setup.ts`) and add the following code to register the Sa11y matcher:

```typescript
import { setup } from '@sa11y/vitest';
// Register the Sa11y matcher with default options
setup();

// Register with custom options for automatic checks and DOM saving
setup({
    autoCheckOpts: { runAfterEach: true, cleanupAfterEach: true },
    renderedDOMSaveOpts: {
        /* your RenderedDOMSaveOpts here */
    },
});
```

-   In your `vitest.config.ts`, add the setup file to the `setupFiles` array:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        setupFiles: ['./vitest-setup.ts'],
    },
});
```

-   This makes the `toBeAccessible` API available for any test in the project.

### Test module level

You can also invoke `setup` before using the `toBeAccessible` API in individual test modules:

```typescript
import { setup } from '@sa11y/vitest';

beforeAll(() => {
    setup();
});
```

-   This makes the `toBeAccessible` API available for the tests only in that specific test module.

## Usage

-   `toBeAccessible` can be invoked on the entire `document` (JSDOM) or on a specific HTML element to check for accessibility:

```typescript
import { setup } from '@sa11y/vitest';
import { extended, full } from '@sa11y/preset-rules';

beforeAll(() => {
    setup();
});

it('should be accessible', async () => {
    // Setup DOM to be tested for accessibility
    // ...

    // Assert that DOM is accessible (using base preset-rule)
    await expect(document).toBeAccessible();

    // Can be used to test accessibility of a specific HTML element
    const elem = document.getElementById('foo');
    await expect(elem).toBeAccessible();

    // To test using an extended ruleset with best practices and experimental rules
    await expect(document).toBeAccessible(extended);

    // To test using all rules provided by axe
    await expect(document).toBeAccessible(full);
});
```

### Caveats

-   **Async**: `toBeAccessible` **must** be invoked with `async/await` or `Promise`.
-   **Fake Timers**: When timers are mocked (e.g. with Vitest's fake timers), the accessibility API can timeout. Switch to real timers before invoking the accessibility API.
-   **DOM**: Accessibility checks require a rendered DOM (e.g., JSDOM or a real browser environment).
-   **template**: [`<template>` elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template) are not rendered in DOM and hence cannot be checked directly without rendering.

## Automatic checks

The Sa11y Vitest API can be set up to be automatically invoked at the end of each test as an alternative to adding the `toBeAccessible` API at the end of each test.

-   When automatic checks are enabled, each child element in the DOM body will be checked for accessibility and failures reported as part of the test.

```typescript
import { setup } from '@sa11y/vitest';

setup({ autoCheckOpts: { runAfterEach: true } });

// To optionally clean up the body after running accessibility checks
setup({ autoCheckOpts: { runAfterEach: true, cleanupAfterEach: true } });

// To customize how/where the rendered DOM is saved during automatic checks
setup({
    autoCheckOpts: { runAfterEach: true },
    renderedDOMSaveOpts: {
        /* your RenderedDOMSaveOpts here */
    },
});
```

#### Options

-   `autoCheckOpts`: Options for automatic accessibility checks (see below)
-   `renderedDOMSaveOpts`: Options for saving the rendered DOM during automatic checks. Allows customizing how and where the DOM is saved for debugging or reporting purposes. See [`@sa11y/matcher` RenderedDOMSaveOpts](../matcher/README.md#rendereddomsaveopts) for details.

**autoCheckOpts:**

-   `runAfterEach`: Run after each test (for integration with test runners)
-   `cleanupAfterEach`: Clean up the DOM after checking
-   `consolidateResults`: Deduplicate results
-   `filesFilter`: Array of file path substrings to skip automatic checks for
-   `enableIncompleteResults`: Include incomplete results

> **Note:** DOM mutation observer mode is not supported: the `runDOMMutationObserver` option and the `SA11Y_ENABLE_DOM_MUTATION_OBSERVER` environment variable are ignored. As `@sa11y/matcher` only saves the rendered DOM in that mode, `renderedDOMSaveOpts` has no effect currently.

**DOM checked:** With the `SA11Y_AUTO` environment variable set, the automatic checks check the final DOM rendered by each test, even when it is cleaned up by an `afterEach` hook running before the automatic checks (e.g. `cleanup()` of [Testing Library](https://testing-library.com/) registered after `setup()`):

-   The DOM is saved when the first node is removed from it in the `afterEach` hooks of a test, and checked instead of the cleaned up DOM
-   Nodes removed during a test, e.g. when a component re-renders, don't save the DOM as it isn't final yet
-   A DOM saved in a test is never checked in another test, e.g. when the automatic checks of the test are skipped
-   A test removing what it rendered at its end, e.g. with `unmount()` or `cleanup()` of Testing Library, removes it during the test. The automatic checks then check the DOM left, e.g. an empty body. Check the rendered DOM with `toBeAccessible()` before removing it.
-   Limitation: when a test is retried after failing in its `afterEach` hooks, e.g. with a11y issues, and a soft assertion (`expect.soft`) fails in the retry, nodes removed during the rest of the retry save the DOM. Such a test fails anyway, but can report a11y issues of a DOM that isn't final.
-   Concurrent tests (e.g. `describe.concurrent`) aren't supported, as they render in the same DOM

## Results Processor

`vitestResultsProcessor` transforms accessibility errors in Vitest test results, mirroring the Jest [group violation results processor](../jest/README.md#group-violation-results-processor). It is meant to be called by a Vitest reporter, e.g. when running [automatic checks](#automatic-checks), before the reporter writes the results:

-   The message and stack of a11y errors are replaced with the a11y violations grouped by rule
-   Other errors are dropped and failed tests without a11y errors are marked as passed, so that only a11y failures are reported
-   Tests nested in suites (`describe` blocks) are processed as well
-   Errors of suites and test files themselves, e.g. from hooks or failing to import a test file, are processed the same way. Suites and test files without a11y errors left in them or their tests are marked as passed.
-   Test results are modified in place. Hence other reporters see the processed results only when registered after the reporter calling the processor.
-   The exit code of the test run is not affected as Vitest sets it before calling the reporters at the end of the run

```typescript
import { experimental_getRunnerTask } from 'vitest/node';
import type { Reporter, TestModule } from 'vitest/node';
import { vitestResultsProcessor } from '@sa11y/vitest';

export default class A11yReporter implements Reporter {
    onTestRunEnd(testModules: ReadonlyArray<TestModule>): void {
        if (process.env.SA11Y_AUTO) {
            vitestResultsProcessor(testModules.map((testModule) => experimental_getRunnerTask(testModule)));
        }
        // Write the results e.g. as JUnit XML
    }
}
```

## Related Packages

-   [`@sa11y/matcher`](../matcher/README.md): Provides the core accessibility checking APIs used by this package. Use it directly for custom test runners or advanced integrations.
