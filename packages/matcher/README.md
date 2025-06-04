<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [`@sa11y/matcher`](#sa11ymatcher)
  - [Overview](#overview)
  - [Install](#install)
  - [Usage](#usage)
    - [Basic Usage](#basic-usage)
    - [Automatic Checks](#automatic-checks)
      - [Options](#options)
    - [Advanced](#advanced)
  - [Caveats](#caveats)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# `@sa11y/matcher`

Accessibility matcher core utilities for custom and framework-agnostic automated accessibility testing.

## Overview

The `@sa11y/matcher` package provides programmatic APIs to check accessibility of HTML elements or the DOM, using the same underlying logic as the Sa11y Jest matcher. It is intended for use in custom test runners, integration with other frameworks, or advanced scenarios where you want direct control over accessibility checks.

## Install

-   Using yarn: `yarn add -D @sa11y/matcher`
-   Using npm: `npm install -D @sa11y/matcher`

## Usage

### Basic Usage

You can use the `runA11yCheck` function to programmatically check the accessibility of the entire document or a specific element.

```javascript
import { runA11yCheck } from '@sa11y/matcher';

(async () => {
    // Check the entire document for accessibility issues
    const result = await runA11yCheck(document);
    if (!result.isAccessible) {
        console.error('Accessibility issues found:', result.a11yError);
    } else {
        console.log('No accessibility issues found!');
    }

    // Check a specific element
    const elem = document.getElementById('foo');
    const elemResult = await runA11yCheck(elem);
    if (!elemResult.isAccessible) {
        // Handle accessibility errors
    }
})();
```

You can also pass a custom ruleset from `@sa11y/preset-rules`:

```javascript
import { runA11yCheck } from '@sa11y/matcher';
import { extended } from '@sa11y/preset-rules';

await runA11yCheck(document, extended);
```

### Automatic Checks

The `runAutomaticCheck` API can be used to automatically check each child element in the DOM body for accessibility issues, similar to the automatic checks in the Jest integration.

```javascript
import { runAutomaticCheck, defaultAutoCheckOpts, defaultRenderedDOMSaveOpts } from '@sa11y/matcher';

await runAutomaticCheck(
    {
        cleanupAfterEach: true, // Optionally clean up the DOM after checking
        runAfterEach: true, // Run after each test (if used in a test runner)
    },
    {
        renderedDOMDumpDirPath: './a11y-dumps',
        generateRenderedDOMFileSaveLocation: (testFilePath, testName) => ({
            fileName: `${testName}.html`,
            fileUrl: `/a11y-dumps/${testName}.html`,
        }),
    }
);
```

#### Options

-   `autoCheckOpts` (`AutoCheckOpts`): Options for automatic accessibility checks (see below)
-   `renderedDOMSaveOpts` (`RenderedDOMSaveOpts`): Options for saving the rendered DOM during automatic checks. Allows customizing how and where the DOM is saved for debugging or reporting purposes.

**AutoCheckOpts:**

-   `runAfterEach`: Run after each test (for integration with test runners)
-   `cleanupAfterEach`: Clean up the DOM after checking
-   `consolidateResults`: Deduplicate results
-   `filesFilter`: Array of file path substrings to skip automatic checks for
-   `runDOMMutationObserver`: Enable DOM mutation observer mode
-   `enableIncompleteResults`: Include incomplete results

**RenderedDOMSaveOpts:**

-   `renderedDOMDumpDirPath`: Directory path where the rendered DOM HTML files will be saved.
-   `generateRenderedDOMFileSaveLocation`: Function to generate the file name and URL for saving the rendered DOM, given the test file path and test name.

### Advanced

You can use other exports for custom integrations, such as `mutationObserverCallback`, `observerOptions`, `RenderedDOMSaveOpts`, `defaultRenderedDOMSaveOpts`, and more.

Accessibility errors are grouped and reported by rule violation for easier debugging.

## Caveats

-   **Async**: All APIs are asynchronous and must be awaited.
-   **DOM**: Accessibility checks require a rendered DOM (e.g., JSDOM or a real browser environment).
-   **Fake Timers**: If using fake timers (e.g., in Jest), switch to real timers before running accessibility checks.
