# `@sa11y/test-utils`

Private package providing test utilities for @sa11y packages

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Usage](#usage)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Usage

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
