/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { AxeResults } from '@sa11y/common';

/**
 * Custom formatter to format a11y violations found by axe
 * Use `JSON.stringify` to return violations without formatting
 */
export interface Formatter {
    (violations: AxeResults): string;
}

/**
 * Highlights the import part of the error message
 */
export interface Highlighter {
    (text: string): string;
}

/**
 * Optional parameters used while formatting a11y issues
 */
export interface Options {
    a11yViolationIndicator: string;
    helpUrlIndicator: string;
    formatter?: Formatter;
    highlighter: Highlighter;
}

/**
 * Default options to be used while formatting a11y issues
 */
const defaultOptions: Options = {
    a11yViolationIndicator: '*',
    helpUrlIndicator: '-',
    // TODO (refactor): Create a Default formatter that points to A11yError.format()
    formatter: undefined,
    highlighter: (text: string): string => text,
};

const defaultImpact = 'minor'; // if impact is undefined
// Helper object to sort violations by impact order
const impactOrder = {
    critical: 1,
    serious: 2,
    moderate: 3,
    minor: 4,
};

/**
 * Sorts give a11y results from axe in order of impact
 */
export function sortViolations(violations: AxeResults): void {
    violations.sort((a, b) => {
        const aImpact = impactOrder[a.impact || defaultImpact];
        const bImpact = impactOrder[b.impact || defaultImpact];
        if (aImpact < bImpact) return -1;
        if (aImpact > bImpact) return 1;
        return 0;
    });
}

/**
 *  Custom error object to represent a11y violations
 */
export class A11yError extends Error {
    static readonly errMsgHeader = 'accessibility issues found';

    constructor(readonly violations: AxeResults) {
        super(`${violations.length} ${A11yError.errMsgHeader}`);
        this.name = A11yError.name;
        this.message = `${violations.length} ${A11yError.errMsgHeader}\n ${this.format()}`;
    }

    static checkAndThrow(violations: AxeResults): void {
        if (violations.length > 0) {
            throw new A11yError(violations);
        }
    }

    get length(): number {
        return this.violations.length;
    }

    /**
     * Format a11y violations into a readable format highlighting important information to help fixing the issue.
     * @param opts - Options used for formatting a11y issues.
     */
    format(opts: Partial<Options> = defaultOptions): string {
        const options = Object.assign(Object.assign({}, defaultOptions), opts);
        if (options.formatter !== undefined) {
            return options.formatter(this.violations);
        }

        sortViolations(this.violations);
        return this.violations
            .map((violation) => {
                return violation.nodes
                    .map((node) => {
                        const selectors = node.target.join(', ');
                        const helpURL = violation.helpUrl.split('?')[0];
                        // TODO : Add wcag level or best practice tag to output ?
                        // const criteria = violation.tags.filter((tag) => tag.startsWith('wcag2a') || tag.startsWith('best'));

                        return (
                            options.highlighter(
                                `${options.a11yViolationIndicator} (${violation.id}) ${violation.help}: ${selectors}`
                            ) + `\n\t${options.helpUrlIndicator} Help URL: ${helpURL}`
                        );
                    })
                    .join('\n\n');
            })
            .join('\n\n');
    }
}
