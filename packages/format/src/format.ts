/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Result } from 'axe-core';

/**
 * Custom formatter to format a11y violations found by axe
 * Use `JSON.stringify` to return violations without formatting
 */
export interface Formatter {
    (violations: Result[]): string;
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
    a11yViolationIndicator?: string;
    helpUrlIndicator?: string;
    formatter?: Formatter;
    highlighter?: Highlighter;
}

const DefaultHighlighter = (text: string): string => text;

/**
 * Default options to be used while formatting a11y issues
 */
const DefaultOptions: Options = {
    a11yViolationIndicator: '*',
    helpUrlIndicator: '-',
    formatter: undefined,
    highlighter: DefaultHighlighter,
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
export function sortViolations(violations: Result[]): void {
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
    constructor(readonly violations: Result[]) {
        super(`${violations.length} accessibility issues found`);
        this.name = A11yError.name;
    }

    get message(): string {
        // TODO (debug): Why is this not used (in code cov) even when A11yError.message is called ?
        //  Looks like the super().message is invoked
        /* istanbul ignore next */
        return this.format();
    }

    get length(): number {
        return this.violations.length;
    }

    /**
     * Format a11y violations into a readable format highlighting important information to help fixing the issue.
     * @param options - Options used for formatting a11y issues.
     */
    format(options: Options = {}): string {
        options = { ...DefaultOptions, ...options };
        if (options.formatter) {
            return options.formatter(this.violations);
        }

        // Note: Workaround for "TS2722: Cannot invoke an object which is possibly 'undefined'."
        const highlighter = options.highlighter || DefaultHighlighter;

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
                            highlighter(
                                `${options.a11yViolationIndicator} (${violation.id}) ${violation.help}: ${selectors}`
                            ) + `\n\t${options.helpUrlIndicator} Help URL: ${helpURL}`
                        );
                    })
                    .join('\n\n');
            })
            .join('\n\n');
    }
}
