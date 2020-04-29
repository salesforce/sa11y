# `@sa11y/test-utils`

Private package providing test utilities for @sa11y packages

## Usage

```typescript
import {
    afterEachCleanup,
    beforeAllSetup,
    domWithA11yIssues,
    domWithNoA11yIssues,
} from '@sa11y/test-utils';

import { toBeAccessible } from '@sa11y/jest';

beforeAll(() => {
    beforeAllSetup();
    expect.extend({toBeAccessible});
});

afterEach(() => {
    afterEachCleanup();
});

describe('...', () => {
    it.('...', async () => {
        document.body.innerHTML = domWithNoA11yIssues;
        await expect(document).toBeAccessible();

        document.body.innerHTML = domWithA11yIssues;
        await expect(document).not.toBeAccessible();
    });
});
```
