# `@sa11y/format`

Format accessibility results from axe

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Usage](#usage)
  - [Basic Formatting](#basic-formatting)
  - [Exception List Filtering](#exception-list-filtering)
  - [Result Processing](#result-processing)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Usage

### Basic Formatting

```javascript
import axe from 'axe-core';
import { A11yError } from '@sa11y/format';

const results = await axe.run();
console.log(A11yError.checkAndThrow(results.violations));
```

### Exception List Filtering

Filter out specific accessibility violations based on rule ID and CSS selectors:

```javascript
import { exceptionListFilter, exceptionListFilterSelectorKeywords } from '@sa11y/format';

// Filter by rule ID and specific CSS selectors
const exceptionList = {
    'color-contrast': ['.btn-secondary', '.text-muted'],
    'landmark-one-main': ['body'],
};
const filteredResults = exceptionListFilter(violations, exceptionList);

// Filter by selector keywords
const keywords = ['known-issue', 'legacy-component'];
const keywordFilteredResults = exceptionListFilterSelectorKeywords(violations, keywords);
```

### Result Processing

Process and enhance accessibility results with WCAG metadata:

```javascript
import { A11yResult, appendWcag } from '@sa11y/format';

// Process individual result
const processedResult = new A11yResult(violationData);

// Add WCAG metadata to results
const resultsWithWcag = appendWcag(violations);
```
