/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { AxeResults, errMsgHeader } from '@sa11y/common';
import { A11yResult, ConsolidatedResults } from './result';

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
export class A11yError extends Error {
    public readonly a11yResults;

    /**
     * Throw error with formatted a11y violations
     * @param violations - List of a11y violations
     * @param opts - Options used for formatting a11y issues
     */
    static checkAndThrow(violations: AxeResults, opts: Partial<Options> = defaultOptions): void {
        if (opts.deduplicate) {
            violations = ConsolidatedResults.add(violations);
            // TODO (debug): Will this affect all errors globally?
            // Error.stackTraceLimit = 0;
        }
        if (violations.length > 0) {
            throw new A11yError(violations, opts);
        }
    }

    constructor(readonly violations: AxeResults, opts: Partial<Options> = defaultOptions) {
        super(`${violations.length} ${errMsgHeader}`);
        this.name = A11yError.name;
        this.a11yResults = A11yResult.convert(this.violations);
        this.message = `${violations.length} ${errMsgHeader}\n ${this.format(opts)}`;
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
                    ) + `\n\t${options.helpUrlIndicator} Help URL: ${a11yResult.helpUrl}`
                );
            })
            .join('\n\n');
    }
}
