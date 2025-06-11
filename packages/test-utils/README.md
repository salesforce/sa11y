# `@sa11y/test-utils`

Private package providing test utilities, mock data, and common testing patterns for `@sa11y` packages.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Usage](#usage)
  - [Basic Setup](#basic-setup)
  - [DOM Fixtures](#dom-fixtures)
  - [WebdriverIO Utilities](#webdriverio-utilities)
  - [Test Data](#test-data)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Usage

### Basic Setup

```javascript
import { beforeEachSetup, domWithA11yIssues, domWithNoA11yIssues } from '@sa11y/test-utils';
import { registerSa11yMatcher } from '@sa11y/jest';

beforeAll(() => {
    registerSa11yMatcher();
});

beforeEach(() => {
    beforeEachSetup();
});

describe('...', () => {
    it('...', async () => {
        document.body.innerHTML = domWithNoA11yIssues;
        await expect(document).toBeAccessible();

        document.body.innerHTML = domWithA11yIssues;
        await expect(document).not.toBeAccessible();
    });
});
```

### DOM Fixtures

The package provides pre-built DOM fixtures for testing:

```javascript
import {
    domWithA11yIssues,
    domWithNoA11yIssues,
    htmlFileWithA11yIssues,
    htmlFileWithNoA11yIssues,
} from '@sa11y/test-utils';

// DOM strings with known accessibility issues
document.body.innerHTML = domWithA11yIssues;

// DOM strings with no accessibility issues
document.body.innerHTML = domWithNoA11yIssues;

// HTML file paths for testing with browser environments
await browser.url(htmlFileWithA11yIssues);
```

### WebdriverIO Utilities

For WebdriverIO integration testing:

```javascript
import { beforeEachSetupWdio, cartesianProduct, audioURL, videoURL } from '@sa11y/test-utils';

describe('WDIO tests', () => {
    beforeEach(() => {
        beforeEachSetupWdio();
    });

    // Use media URLs for testing audio/video accessibility
    // Use cartesianProduct for generating test combinations
});
```

### Test Data

The package includes various test data and utilities:

-   **Media URLs**: Audio and video file URLs for testing multimedia accessibility
-   **Cartesian Product**: Utility for generating test case combinations
-   **Mock Data**: Various mock objects and data structures for testing
