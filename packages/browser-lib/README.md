# `@sa11y/browser-lib`

Provides a minified version of selected `@sa11y` libraries to be injected into a browser (using webdriver) and executed from integration testing workflows with non-WebdriverIO frameworks such as [Selenium Java] where the [`@sa11y/wdio`](../wdio/README.md) package cannot be used. This allows for reuse of the `@sa11y` libraries across unit and integration testing workflows.

Code in this package should be limited only to wrappers required to facilitate execution in browser environment. All primary code should be added to `@sa11y` libraries.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Build](#build)
- [Usage](#usage)
  - [Selenium Java](#selenium-java)
  - [WebdriverIO](#webdriverio)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Build

-   `yarn build`
    -   generates the `sa11y.min.js` and `sa11y.js` bundles
    -   `yarn build:watch` or `yarn build:debug` can be used during development
-   `yarn test`
    -   tests the generated JS bundles

## Usage

Demonstrate using `sa11y.min.js` with both Selenium Java and WebdriverIO (Javascript) frameworks.

### Selenium Java

Using [Selenium Java] library

```java
public class Sa11yTest {
  InputStream sa11yMinJSFile = Sa11yTest.class.getClassLoader().getResourceAsStream("sa11y.min.js");
  String sa11yMinJS = new BufferedReader(new InputStreamReader(sa11yMinJSFile)).lines().collect(Collectors.joining());
  WebDriver driver = new ChromeDriver();

  @Test
  void testSa11yVersion() {
    ((JavascriptExecutor) this.driver).executeScript(sa11yMinJS);
    Object response = ((JavascriptExecutor) this.driver).executeScript("return sa11y.version;");
    assertEquals("0.2.0-alpha.0", response.toString());

    // Call API to get a11y violations
    Object response = ((JavascriptExecutor) this.driver).executeScript("return await sa11y.checkAccessibility();");
    // Decode response with a JSON de-serialization library ...
    //  e.g. results = new ObjectMapper().readValue(response, ..);
    driver.quit();
  }
}
```

### WebdriverIO

Using [WebdriverIO](https://webdriver.io/) framework

```javascript
describe('demonstrate usage of sa11y.min.js', () => {
    it('should inject minified js', () => {
        const sa11yMinJs = fs.readFileSync(path.resolve(__dirname, '../dist/sa11y.min.js')).toString();

        browser.execute(sa11yMinJs);
        // After injecting sa11y and axe should be defined
        expect(browser.execute('return typeof sa11y')).toEqual('object');
        expect(browser.execute('return axe.version')).toEqual(axeVersion);
        // Call API to get a11y violations
        const results = browser.execute('return await sa11y.checkAccessibility();');
    });
});
```

[selenium java]: https://www.selenium.dev/selenium/docs/api/java/index.html
