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

const DefaultHighlighter = (text: string): string => text;

/**
 * Optional parameters used while formatting a11y issues
 */
export interface Options {
    a11yViolationIndicator?: string;
    helpUrlIndicator?: string;
    formatter?: Formatter;
    highlighter?: Highlighter;
}

/**
 * Default options to be used while formatting a11y issues
 */
const DefaultOptions: Options = {
    a11yViolationIndicator: '*',
    helpUrlIndicator: '-',
    formatter: undefined,
    highlighter: DefaultHighlighter,
};

/**
 *  Custom error object to represent a11y violations
 */
export class A11yError extends Error {
    constructor(readonly violations: Result[]) {
        super(`${violations.length} accessibility issues found`);
        this.name = A11yError.name;
    }

    get length(): number {
        return this.violations.length;
    }

    get message(): string {
        return this.format();
    }

    /**
     * Format a11y violations into a readable format highlighting important information to help fixing the issue.
     * @param options - Options used for formatting a11y issues.
     */
    format(options?: Options): string {
        options = { ...DefaultOptions, ...options };
        if (options.formatter) {
            return options.formatter(this.violations);
        }

        const highlighter = options.highlighter || DefaultHighlighter;

        return this.violations
            .map((violation) => {
                return violation.nodes
                    .map((node) => {
                        const selectors = node.target.join(', ');
                        const helpURL = violation.helpUrl.split('?')[0];
                        return (
                            highlighter(
                                `${options?.a11yViolationIndicator} (${violation.id}) ${violation.help}: ${selectors}`
                            ) + `\n\t${options?.helpUrlIndicator} Help URL: ${helpURL}`
                        );
                    })
                    .join('\n\n');
            })
            .join('\n\n');
    }
}
