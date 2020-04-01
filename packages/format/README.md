# `format`

Format accessibility results from axe

## Usage

```
import { a11yResultsFormatter } from '@sa11y/format';

const results = await axe.run();
console.log(a11yResultsFormatter(results.violations));
```
