# `@sa11y/wdio`

Provides `assertAccessible()`, `assertAccessibleSync()` APIs that can be used with [WebdriverIO](https://webdriver.io/) to check accessibility of web pages rendered in browsers.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Caution](#caution)
- [Usage](#usage)
- [Reference](#reference)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Caution

-   **headless**: Checks such as color contrast do not work in headless mode. In general executing tests in headless mode [might yield different accessibility results](https://github.com/dequelabs/axe-core/issues/2088). Hence, it is recommended to run accessibility checks in windowed mode when possible for accurate results.

## Usage

```javascript
import { assertAccessible, assertAccessibleSync } from '@sa11y/wdio';

describe('demonstrate usage of @sa11y/wdio', () => {
    it('should demonstrate usage of assertAccessible API', async () => {
        // Navigate to page to be tested
        await browser.url('pageToBeTested.html');
        // Check for accessibility of the loaded page
        await assertAccessible();
    });

    it('should demonstrate usage of assertAccessibleSync API', () => {
        return sync(() => {
            // Navigate to page to be tested
            browser.url('pageToBeTested.html');
            // Check for accessibility of the loaded page
            assertAccessibleSync();
        });
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
});
```
### Options
An options object containing following properties can be passed to WDIO APIs
* `driver` - [WDIO BrowserObject](https://webdriver.io/docs/browserobject/) instance navigated to the page to be checked.
  * Created automatically by WDIO test runner.
  * Might need to be passed in explicitly when other test runners are used.
* `scope` - Element to check for accessibility found using [`browser.$(selector)`](https://webdriver.io/docs/selectors).
  * Defaults to the entire document.
* `rules` - [@sa11y/preset-rules](https://github.com/salesforce/sa11y/blob/master/packages/preset-rules/README.md) used for checking accessibility.
  * Defaults to `base` ruleset.
* `exceptionList` - map of rule id to corresponding CSS targets that needs to be filtered from results

![Screenshot showing a11y errors from a test using Sa11y WDIO in a terminal](https://github.com/salesforce/sa11y/blob/media/screenshot/wdio.png?raw=true)

## Reference

-   [Sync mode vs async · WebdriverIO](https://webdriver.io/docs/sync-vs-async.html)
