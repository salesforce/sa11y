# `@sa11y/wdio`

Provides a `assertAccessible()` API that can be used with [WebdriverIO](https://webdriver.io/) to check accessibility of web pages rendered in browsers

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Usage](#usage)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Usage

```javascript
import { assertAccessible } from '@sa11y/wdio';

it('should demonstrate usage of assertAccessible API from @sa11y/wdio', async () => {
    // Navigate to page to be tested
    await browser.url('pageToBeTested.html');
    // Check for accessibility of the loaded page
    await assertAccessible();
});
```
