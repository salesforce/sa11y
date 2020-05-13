# `@sa11y/preset-rules`

Accessibility preset rule configs for axe

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Usage](#usage)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Usage

```javascript
import axe from 'axe-core';
import { extended } from '@sa11y/preset-rules';

const a11yResults = await axe.run(extended);
console.log(a11yResults);
```
