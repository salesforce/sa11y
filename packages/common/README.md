# `@sa11y/common`

Common utilities, constants, error messages, and helper functions for `@sa11y` packages.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Overview](#overview)
- [Utilities](#utilities)
  - [Environment Detection](#environment-detection)
  - [Custom Rules](#custom-rules)
  - [File Processing](#file-processing)
  - [Result Processing](#result-processing)
- [Environment Variables](#environment-variables)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Overview

This package provides shared functionality used across all `@sa11y` packages. It includes utilities for environment detection, custom rule management, file processing, and result handling.

## Utilities

### Environment Detection

```javascript
import { log, isFakeTimerUsed } from '@sa11y/common';

// Debug logging (only outputs when SA11Y_DEBUG is set)
log('Debug message');

// Check if fake timers are being used
if (isFakeTimerUsed()) {
    // Handle fake timer scenario
}
```

### Custom Rules

```javascript
import { useCustomRules, registerCustomRules } from '@sa11y/common';

// Load custom rules from environment
const customRules = useCustomRules();

// Register custom axe rules
registerCustomRules(changesData, rulesData, checkData);
```

### File Processing

```javascript
import { processFiles, writeHtmlFileInPath } from '@sa11y/common';

// Process files in a directory
const results = [];
processFiles('/path/to/directory', results, '.json', JSON.parse);

// Write HTML file for debugging
writeHtmlFileInPath('/output/path', 'test.html', '<html>...</html>');
```

### Result Processing

```javascript
import { getViolations, getIncomplete } from '@sa11y/common';

// Get violations using a custom checker function
const violations = await getViolations(async () => {
    const results = await axe.run();
    return results.violations;
});

// Get incomplete results
const incomplete = await getIncomplete(async () => {
    const results = await axe.run();
    return results.incomplete;
});
```

## Environment Variables

-   `SA11Y_DEBUG`: Enable debug logging
-   `SA11Y_CUSTOM_RULES`: Path to custom rules JSON file
-   `SA11Y_AUTO_FILTER_LIST_PACKAGE_NAME`: Package name for auto-filter list
-   `SA11Y_AUTO_FILTER_LIST_PACKAGE_REQUIREMENT`: Package requirement for auto-filter
