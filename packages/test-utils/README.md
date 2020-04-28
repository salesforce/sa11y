# `@sa11y/test-utils`

Private package providing test utilities for @sa11y packages

## Usage

```
import {
    afterEachCleanup,
    beforeAllSetup,
    domWithA11yIssues,
    domWithNoA11yIssues,
} from '@sa11y/test-utils';

import { toBeAccessible } from '@sa11y/jest';


beforeAll(() => {
    beforeAllSetup();
});

afterEach(() => {
    afterEachCleanup();
});

describe('..', () => {
    it.('...', () => {
        document.body.innerHTML = domWithNoA11yIssues;
        await expect(document).toBeAccessible();

        document.body.innerHTML = domWithA11yIssues;
        await expect(document).not.toBeAccessible();
    });

```
