# `@sa11y/wdio`

Provides `assertAccessible()`, `assertAccessibleSync()` APIs that can be used with [WebdriverIO](https://webdriver.io/) to check accessibility of web pages rendered in browsers.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Caution](#caution)
- [Usage](#usage)
  - [Async Mode (Recommended)](#async-mode-recommended)
  - [Sync Mode (Deprecated)](#sync-mode-deprecated)
- [API](#api)
  - [assertAccessible](#assertaccessible)
  - [assertAccessibleSync](#assertaccessiblesync)
- [Reference](#reference)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Caution

-   **headless**: Checks such as color contrast do not work in headless mode. In general executing tests in headless mode [might yield different accessibility results](https://github.com/dequelabs/axe-core/issues/2088). Hence, it is recommended to run accessibility checks in windowed mode when possible for accurate results.

## Usage

### Async Mode (Recommended)

```javascript
import { assertAccessible } from '@sa11y/wdio';

describe('demonstrate usage of @sa11y/wdio', () => {
    it('should demonstrate usage of assertAccessible API', async () => {
        // Navigate to page to be tested
        await browser.url('pageToBeTested.html');
        // Check for accessibility of the loaded page
        await assertAccessible();
    });

    it('should demonstrate checking a11y of a selected element', async () => {
        // Navigate to page to be tested
        await browser.url('pageToBeTested.html');
        // Check accessibility of a particular element using https://webdriver.io/docs/selectors
        await assertAccessible({ scope: browser.$('selector') });
    });

    it('should demonstrate exception list', async () => {
        // Navigate to page to be tested
        await browser.url('pageToBeTested.html');
        // Exception list is a map of rule to corresponding css targets that needs to be filtered from a11y results
        const exceptions = {
            'document-title': ['html'],
            'link-name': ['a'],
        };
        // Check for accessibility of the loaded page, filtering out results from given exception list
        await assertAccessible({ exceptionList: exceptions });
    });

    it('should demonstrate custom rules', async () => {
        await browser.url('pageToBeTested.html');
        // Use extended ruleset for more comprehensive checking
        await assertAccessible({ rules: extended });
    });
});
```

### Sync Mode (Deprecated)

> **Note**: WebdriverIO sync mode is deprecated. Please use async mode for new projects.

```javascript
import { assertAccessibleSync } from '@sa11y/wdio';

describe('demonstrate usage of @sa11y/wdio sync', () => {
    it('should demonstrate usage of assertAccessibleSync API', () => {
        return sync(() => {
            // Navigate to page to be tested
            browser.url('pageToBeTested.html');
            // Check for accessibility of the loaded page
            assertAccessibleSync();
        });
    });
});
```

## API

### assertAccessible

Asynchronous API for checking accessibility in WebdriverIO tests.

**Signature:**

```typescript
async function assertAccessible(options?: {
    driver?: WebdriverIO.Browser;
    scope?: WebdriverIO.Element;
    rules?: A11yConfig;
    exceptionList?: Record<string, string[]>;
}): Promise<void>;
```

**Parameters:**

-   `options` (optional): Configuration object
    -   `driver`: WDIO BrowserObject instance. Created automatically by WDIO test runner.
    -   `scope`: Element to check for accessibility. Defaults to the entire document.
    -   `rules`: Preset rules configuration. Defaults to `base` ruleset.
    -   `exceptionList`: Map of rule id to corresponding CSS targets to be filtered from results.

### assertAccessibleSync

Synchronous API for checking accessibility (deprecated with WebdriverIO sync mode).

**Signature:**

```typescript
function assertAccessibleSync(options?: {
    driver?: WebdriverIO.Browser;
    scope?: WebdriverIO.Element;
    rules?: A11yConfig;
    exceptionList?: Record<string, string[]>;
}): void;
```

![Screenshot showing a11y errors from a test using Sa11y WDIO in a terminal](https://github.com/salesforce/sa11y/blob/media/screenshot/wdio.png?raw=true)

## Reference

-   [Sync mode vs async · WebdriverIO](https://webdriver.io/docs/sync-vs-async.html)
