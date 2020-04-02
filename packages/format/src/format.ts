/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Result } from 'axe-core';

/**
 * Function to format accessibility violations found by axe
 */
export interface Formatter {
    (violations: Result[]): string;
}

/**
 * Format accessibility results from axe
 * @param violations - Result list from axe
 * */
// TODO: Add handlebars template for formatting
// TODO: Add support for different output formats console(colored), plain text, HTML, xUnit
export function a11yResultsFormatter(violations: Result[]): string {
    return violations
        .map((violation) => {
            return violation.nodes
                .map((node) => {
                    const selectors = node.target.join(', ');
                    return `${violation.help} (${violation.id}): ${selectors}\n  - More info: ${violation.helpUrl}`;
                })
                .join('\n\n');
        })
        .join('\n\n');
}
