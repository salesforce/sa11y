# `assert`

Provides assertAccessible API to check DOM for accessibility issues

## Usage

// TODO(doc): Generate usage docs from code (using JSDOC, TSDOC etc)

```
import { assertAccessible } from '@sa11y/assert';

// Setup DOM in the state to be tested for accessibility
...
// Assert that the current dom has no a11y issues
// Defaults to using
//  - default document context e.g. JSDOM in Jest
//  - extended ruleset from @sa11y/preset-rules and
//  - a11yResultsFormatter from @sa11y/format
await assertAccessible();

// Can be overridden to use custom dom, ruleset or formatter
//  - Specifying null will result in using JSON stringify
// Customize rules specific to jsdom
const jsdomRules = extended;
jsdomRules.rules = {
    'color-contrast': { enabled: false }, // Disable color-contrast for jsdom
};
await assertAccessible(document, jsdomRules, null);
```
