# `jest`

Accessibility matcher for [Jest](https://jestjs.io)

## Usage

```
import { toBeAccessible, toBeAccessibleWith } from '@sa11y/jest'

// Assert that the DOM is accessible
it('should be accessible', async () => {
    // Setup DOM to be tested for accessibility
    ...
    // assert that dom is accessible (using EXTENDED preset rules)
    await expect(document).toBeAccessible();
    // use RECOMMENDED preset rules
    await expect(document).toBeAccessibleWith(RECOMMENDED);
});
```
