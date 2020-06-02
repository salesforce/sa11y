# `jest`

Accessibility matcher for [Jest](https://jestjs.io)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Setup](#setup)
  - [Project level](#project-level)
  - [Test module level](#test-module-level)
- [Usage](#usage)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Setup

The accessibility matcher helper APIs need to be registered with Jest before they can be used in tests.

### Project level

You can set up the a11y matchers once at the project level to make it available to all the Jest tests in the project.
For an example look at the [Integration tests](../test-integration/README.md).

-   Add a Jest setup file (e.g. `jest-setup.js`) and add the following code that registers the a11y matchers

```javascript
const { registerSa11yMatcher } = require('@sa11y/jest');
registerSa11yMatcher();
```

-   Add/Modify Jest config at project root to invoke the Jest setup file as setup above.
    In the `jest.config.js` at the root of your project, add:

```javascript
module.exports = {
    setupFilesAfterEnv: ['<rootDir>/jest-setup.js'],
};
```

### Test module level

Invoke `registerSa11yMatcher` before using the accessibility matchers in the tests e.g.

```javascript
import { registerSa11yMatcher } from '@sa11y/jest';

beforeAll(() => {
    registerSa11yMatcher();
});
```

## Usage

-   **WARNING**: `toBeAccessible` **must** be invoked with `await` or the equivalent supported async method in your env.
    -   Not invoking it async would result in incorrect results
    -   e.g. no assertions even when page is not accessible
-   `toBeAccessible` jest matcher can be invoked on a `document` (JSDOM) or an HTML element
    to check for accessibility

```javascript
import { recommended } from '@sa11y/preset-rules';
import { registerSa11yMatcher } from '@sa11y/jest';

beforeAll(() => {
    registerSa11yMatcher();
});

it('should be accessible', async () => {
    // Setup DOM to be tested for accessibility
    //...

    // assert that DOM is accessible (using extended preset-rule)
    await expect(document).toBeAccessible();

    // Can be used to test accessibility of a specific HTML element
    const elem = document.getElementById('foo');
    await expect(elem).toBeAccessible();

    // use recommended preset-rule
    await expect(document).toBeAccessible(recommended);
});
```
