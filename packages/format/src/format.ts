/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { AxeResults, errMsgHeader } from '@sa11y/common';
import { A11yResult, A11yResults } from './result';

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
    deduplicate: boolean; // Remove duplicate A11yResult with the same key (id, css)
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
    deduplicate: false,
};

/**
 *  Custom error object to represent a11y violations
 */

export class AxeError extends Error {
    /**
     * Throw error with Axe error
     */

    constructor(message: string) {
        super(message);
        this.name = AxeError.name;
        this.message = message;
    }

    static throwAxeError(e: Error): void {
        throw new AxeError(`${e.message}`);
    }
}

export class A11yError extends Error {
    /**
     * Throw error with formatted a11y violations
     * @param violations - List of a11y violations
     * @param opts - Options used for formatting a11y issues
     */
    static checkAndThrow(violations: AxeResults, opts: Partial<Options> = defaultOptions): void {
        let a11yResults = A11yResults.convert(violations).sort();
        if (opts.deduplicate) {
            a11yResults = A11yResults.add(a11yResults);
        }
        if (a11yResults.length > 0) {
            throw new A11yError(violations, a11yResults, opts);
        }
    }

    constructor(
        readonly violations: AxeResults,
        readonly a11yResults: A11yResult[],
        opts: Partial<Options> = defaultOptions
    ) {
        super(`${a11yResults.length} ${errMsgHeader}`);
        this.name = A11yError.name;
        this.message = `${a11yResults.length} ${errMsgHeader}\n ${this.format(opts)}`;
    }

    get length(): number {
        return this.a11yResults.length;
    }

    /**
     * Format a11y violations into a readable format highlighting important information to help fixing the issue.
     * @param opts - Options used for formatting a11y issues.
     */
    format(opts: Partial<Options>): string {
        const options = { ...defaultOptions, ...opts };
        // TODO (code cov): Fails only in CI, passes locally
        /* istanbul ignore next */
        if (options.formatter !== undefined) {
            return options.formatter(this.violations);
        }

        return this.a11yResults
            .map((a11yResult) => {
                return (
                    options.highlighter(
                        `${options.a11yViolationIndicator} (${a11yResult.id}) ${a11yResult.description}: ${a11yResult.selectors}`
                    ) +
                    `\n\t${options.helpUrlIndicator} Help URL: ${a11yResult.helpUrl} \n\t${options.helpUrlIndicator} WCAG Criteria: ${a11yResult.wcag}`
                );
            })
            .join('\n\n');
    }
}
