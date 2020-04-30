# `jest`

Accessibility matcher for [Jest](https://jestjs.io)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Setup](#setup)
- [Usage](#usage)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Setup

-   TODO: Based on https://github.com/jest-community/jest-extended#setup

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
    await expect(document).toBeAccessibleWith(recommended);
});
```
