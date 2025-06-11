# `@sa11y/browser-lib`

Provides a minified version of selected `@sa11y` libraries to be injected into a browser (using webdriver) and executed from integration testing workflows with non-WebdriverIO frameworks such as [Selenium Java] where the [`@sa11y/wdio`](../wdio/README.md) package cannot be used. This allows for reuse of the `@sa11y` libraries across unit and integration testing workflows.

Code in this package should be limited only to wrappers required to facilitate execution in browser environment. All primary code should be added to `@sa11y` libraries.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Build](#build)
- [Usage](#usage)
  - [Selenium Java](#selenium-java)
  - [WebdriverIO](#webdriverio)
- [API](#api)
  - [checkAccessibility](#checkaccessibility)

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
    assertEquals("5.1.0", response.toString());

    // Call API to get a11y violations
    Object response = ((JavascriptExecutor) this.driver).executeScript("return await sa11y.checkAccessibility();");
    // Decode response with a JSON de-serialization library ...
    //  e.g. results = new ObjectMapper().readValue(response, ..);
    driver.quit();
  }

  @Test
  void testSa11yWithCustomOptions() {
    ((JavascriptExecutor) this.driver).executeScript(sa11yMinJS);

    // Check accessibility with custom scope and exception list
    String script = "return await sa11y.checkAccessibility(" +
        "document.querySelector('#main-content'), " +
        "sa11y.base, " +
        "{'color-contrast': ['body']}, " +
        "true, " +
        "'violations');";
    Object response = ((JavascriptExecutor) this.driver).executeScript(script);
    // Process results...
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

    it('should check accessibility with different report types', () => {
        const sa11yMinJs = fs.readFileSync(path.resolve(__dirname, '../dist/sa11y.min.js')).toString();
        browser.execute(sa11yMinJs);

        // Check for violations (default)
        const violations = browser.execute('return await sa11y.checkAccessibility();');

        // Check for incomplete results
        const incomplete = browser.execute(
            "return await sa11y.checkAccessibility(document, sa11y.base, {}, true, 'incomplete');"
        );
    });
});
```

## API

### checkAccessibility

The main API for checking accessibility in the browser environment.

**Signature:**

```javascript
async function checkAccessibility(
    scope = document,
    rules = defaultRuleset,
    exceptionList = {},
    addWcagInfo = true,
    reportType = 'violations'
)
```

**Parameters:**

-   `scope` (optional): Element to check for accessibility. Defaults to the entire document.
-   `rules` (optional): Preset sa11y rules configuration. Defaults to base ruleset. Available: `sa11y.base`, `sa11y.extended`, `sa11y.full`
-   `exceptionList` (optional): Mapping of rule ID to CSS selectors to be filtered out from results
-   `addWcagInfo` (optional): Flag to add WCAG information to the results. Defaults to true.
-   `reportType` (optional): Type of report to generate. Either 'violations' or 'incomplete'. Defaults to 'violations'.

**Returns:** JSON string containing the accessibility results.

**Examples:**

```javascript
// Basic usage - check entire document
const results = await sa11y.checkAccessibility();

// Check specific element with extended rules
const results = await sa11y.checkAccessibility(document.querySelector('#main-content'), sa11y.extended);

// Use exception list to filter out known issues
const results = await sa11y.checkAccessibility(document, sa11y.base, {
    'color-contrast': ['.known-issue'],
    'landmark-one-main': ['body'],
});

// Get incomplete results instead of violations
const incompleteResults = await sa11y.checkAccessibility(document, sa11y.base, {}, true, 'incomplete');
```

[selenium java]: https://www.selenium.dev/selenium/docs/api/java/index.html
