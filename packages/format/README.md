# `@sa11y/format`

Format accessibility results from axe

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Usage](#usage)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Usage

```javascript
import axe from 'axe-core';
import { A11yError } from '@sa11y/format';

const results = await axe.run();
console.log(A11yError.checkAndThrow(results.violations));
```
