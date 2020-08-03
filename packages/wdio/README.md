# `@sa11y/wdio`

Provides `assertAccessible()`, `assertAccessibleSync()` APIs that can be used with [WebdriverIO](https://webdriver.io/) to check accessibility of web pages rendered in browsers.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Usage](#usage)
- [Reference](#reference)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

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
        // Navigate to page to be tested
        browser.url('pageToBeTested.html');
        // Check for accessibility of the loaded page
        assertAccessibleSync();
    });
});
```

![Screenshot showing a11y errors showing up in terminal for a test using Sa11y WDIO](https://github.com/salesforce/sa11y/blob/media/screenshot/wdio.png?raw=true)

## Reference

-   [Sync mode vs async · WebdriverIO](https://webdriver.io/docs/sync-vs-async.html)
