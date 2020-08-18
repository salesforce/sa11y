# `@sa11y/browser-lib`

Provides a minified version of selected `@sa11y` libraries to be injected into a browser (using webdriver) and executed from integration testing workflows with non-WebdriverIO frameworks such as [Selenium Java](https://www.selenium.dev/selenium/docs/api/java/) where the [`@sa11y/wdio`](./packages/wdio/README.md) package cannot be used. This allows for reuse of the `@sa11y` libraries across unit and integration testing workflows.

Code in this package should be limited only to wrappers required to facilitate execution in browser environment. All primary code should be added to `@sa11y` libraries.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Usage](#usage)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Usage

```javascript
describe('demonstrate usage of sa11y.min.js', () => {
    it('should inject minified js', async () => {
        const sa11yMinJs = fs.readFileSync(path.resolve(__dirname, '../dist/sa11y.min.js')).toString();

        browser.execute(sa11yMinJs);
        // After injecting sa11y and axe should be defined
        expect(browser.execute('return typeof sa11y')).toEqual('object');
        expect(browser.execute('return axe.version')).toEqual(axeVersion);
    });
});
```
