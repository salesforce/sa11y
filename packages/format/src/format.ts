/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { AxeResults, errMsgHeader, createA11yRuleViolation } from '@sa11y/common';
import type { A11yViolation } from '@sa11y/common';
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
    renderedDOMSavedFileName?: string;
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
    renderedDOMSavedFileName: '',
};

/**
 *  Custom error object to represent a11y violations
 */
export class A11yError extends Error {
    renderedDOMSavedFileName: string;

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
        this.renderedDOMSavedFileName = opts.renderedDOMSavedFileName ?? '';
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

        const a11yRuleViolations: { [key: string]: A11yViolation } = {};
        let a11yRuleViolationsCount = 0;
        let a11yErrorElementsCount = 0;
        this.a11yResults.forEach((a11yResult) => {
            a11yErrorElementsCount++;
            if (!(a11yRuleViolations as never)[a11yResult.wcag]) {
                a11yRuleViolationsCount++;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                a11yRuleViolations[a11yResult.wcag] = {
                    id: a11yResult.id,
                    description: a11yResult.description,
                    helpUrl: a11yResult.helpUrl,
                    wcagCriteria: a11yResult.wcag,
                    summary: a11yResult.summary,
                    errorElements: [],
                };
            }
            a11yRuleViolations[a11yResult.wcag].errorElements.push({
                html: a11yResult.html,
                selectors: a11yResult.selectors,
                hierarchy: a11yResult.ancestry,
                any: a11yResult.any,
                all: a11yResult.all,
                none: a11yResult.none,
                relatedNodeAny: a11yResult.relatedNodeAny,
                relatedNodeAll: a11yResult.relatedNodeAll,
                relatedNodeNone: a11yResult.relatedNodeNone,
                message: a11yResult?.message,
            });
        });

        const a11yFailureMessage = `
    ${opts?.renderedDOMSavedFileName ? `HTML Source: ${opts.renderedDOMSavedFileName}\n` : ''}
    The test has failed the accessibility check. Accessibility Stacktrace/Issues:
    ${a11yErrorElementsCount} HTML elements have accessibility issue(s). ${a11yRuleViolationsCount} rules failed.
    
    ${Object.values(a11yRuleViolations)
        .map((a11yRuleViolation, index) => createA11yRuleViolation(a11yRuleViolation, index + 1))
        .join('\n')}
    
        
    For more info about automated accessibility testing: https://sfdc.co/a11y-test
    For tips on fixing accessibility bugs: https://sfdc.co/a11y
    For technical questions regarding Salesforce accessibility tools, contact our Sa11y team: http://sfdc.co/sa11y-users
    For guidance on accessibility related specifics, contact our A11y team: http://sfdc.co/tmp-a11y
        `;

        return a11yFailureMessage;
    }
}
