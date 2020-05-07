# `assert`

Provides assertAccessible API to check DOM for accessibility issues

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Usage](#usage)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Usage

```javascript
import { assertAccessible } from '@sa11y/assert';
import { recommended } from '@sa11y/preset-rules';

// Setup DOM in the state to be tested for accessibility
// ...
// Assert that the current dom has no a11y issues
// Defaults to using
//  - default document context e.g. JSDOM in Jest
//  - extended ruleset from @sa11y/preset-rules and
//  - a11yResultsFormatter from @sa11y/format
await assertAccessible();

// Can be used to test accessibility of a specific HTML element
const elem = document.getElementById('foo');
await assertAccessible(elem);

// Can be overridden to use custom dom, ruleset or formatter
//  - Specifying null for formatter will result in using JSON stringify
await assertAccessible(document, recommended, null);
```
