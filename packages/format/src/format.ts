/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Result } from 'axe-core';
// import { printReceived } from 'jest-matcher-utils';

const a11yViolationIndicator = '⭕';
const helpUrlIndicator = '🔗';

/**
 * Formatter defines the function signature to format accessibility violations found by axe
 */
export interface Formatter {
    (violations: Result[]): string;
}

/**
 * Get num of a11y issues from a11y violations error object
 * @param a11yViolations - error thrown from `@sa11y/assert` containing a11y violations
 */
export function getNumIssues(a11yViolations: string): number {
    // TODO (Refactor): Operate on Result[] instead of the error object
    // TODO (Refactor): Construct a custom error object for a11y violations
    return a11yViolations.toString().split(a11yViolationIndicator).length - 1;
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
                    const helpURL = violation.helpUrl.split('?')[0];
                    return (
                        // TODO: Create a formatter specifically for Jest using printReceived etc?
                        `${a11yViolationIndicator} (${violation.id}) ${violation.help}: ${selectors}` +
                        `\n\t${helpUrlIndicator} Help URL: ${helpURL}`
                    );
                })
                .join('\n\n');
        })
        .join('\n\n');
}
