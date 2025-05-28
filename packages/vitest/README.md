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
// Register the Sa11y matcher
setup();
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
```

#### Options

-   `runAfterEach`: Run after each test (for integration with test runners)
-   `cleanupAfterEach`: Clean up the DOM after checking
-   `consolidateResults`: Deduplicate results
-   `filesFilter`: Array of file path substrings to skip automatic checks for
-   `runDOMMutationObserver`: Enable DOM mutation observer mode
-   `enableIncompleteResults`: Include incomplete results

## Results Processor

A custom results processor is available for transforming accessibility errors in Vitest test results.  
See the API: `vitestResultsProcessor`.

## Related Packages

-   [`@sa11y/matcher`](../matcher/README.md): Provides the core accessibility checking APIs used by this package. Use it directly for custom test runners or advanced integrations.
