# `jest`

Accessibility matcher for [Jest](https://jestjs.io)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Setup](#setup)
  - [Automatic](#automatic)
  - [Manual](#manual)
- [Usage](#usage)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Setup

The accessibility matcher helper APIs need to be registered with Jest before they can be used in tests.

### Automatic

Modify Jest config to add the required setup for accessibility matchers.

In the `jest.config.js` at the root of your project, add

```javascript
const { jestConfig } = require('@sa11y/jest');

module.exports = {
    ...jestConfig,
    // Your config ..
};
```

### Manual

Invoke `registerA11yMatchers` before using the accessibility matchers in the tests.

```typescript
import { registerA11yMatchers } from '@sa11y/jest';

beforeAll(() => {
    registerA11yMatchers();
});
```

## Usage

```typescript
import { recommended } from '@sa11y/preset-rules';
import { registerA11yMatchers } from "@sa11y/jest";


beforeAll(() => {
    registerA11yMatchers();
});

it('should be accessible', async () => {
    // Setup DOM to be tested for accessibility
    ...

    // assert that DOM is accessible (using extended preset-rule)
    await expect(document).toBeAccessible();

    // use recommended preset-rule
    await expect(document).toBeAccessible(recommended);
});
```
