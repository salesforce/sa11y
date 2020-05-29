/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Result } from 'axe-core';
import { printReceived } from 'jest-matcher-utils';

/**
 * Formatter defines the function signature to format accessibility violations found by axe
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
                    const helpURL = violation.helpUrl.split('?')[0];
                    return (
                        // TODO: Create a formatter specifically for Jest using printReceived etc?
                        printReceived(`⭕ (${violation.id}) ${violation.help}: ${selectors}`) +
                        `\n\t🔗 Help URL: ${helpURL}`
                    );
                })
                .join('\n\n');
        })
        .join('\n\n');
}
