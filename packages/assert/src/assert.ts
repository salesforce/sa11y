/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import axe, { Result, RunOptions } from 'axe-core';
// TODO (Fix): Figure out how to remove 'dist' from import path
import { extended } from '@sa11y/preset-rules/dist/extended';
import { AxeConfig } from '@sa11y/preset-rules/dist/axeConfig';

/**
 * Wrap axe.run() into a Promise
 * @param html - document to be tested
 * @param options - axe run options
 */
export function runAxe(html = document, options: RunOptions = {}): Promise<Result[]> {
    return new Promise((resolve, reject) => {
        axe.run(html, options, (err, results) => {
            if (err) reject(err);
            resolve(results.violations);
        });
    });
}

/**
 * Checks DOM for accessibility issues and throws an error if violations are found.
 * @param dom - DOM to be tested for accessibility
 * @param rules - AxeConfig preset rule to use, defaults to extended
 * @throws error - with the accessibility issues found
 * */
export function assertAccessible(dom: Document = document, rules: AxeConfig = extended): void {
    const axeErrMsgPrefix = 'Error running accessibility checks using axe:';
    // axe.run(dom as ElementContext, rules as RunOptions)
    //     .then((result) => {
    //         const violations = result.violations;
    //         if (typeof violations === 'undefined') {
    //             throw new Error(`${axeErrMsgPrefix} no violations returned`);
    //         }
    //         if (violations.length > 0) {
    //             throw new Error(violations.join('\n\n'));
    //         }
    //     })
    //     .catch((e) => {
    //         throw new Error(`${axeErrMsgPrefix} ${e}`);
    //     });
    runAxe(dom, rules as RunOptions)
        .then((violations) => {
            if (typeof violations === 'undefined') {
                throw new Error(`${axeErrMsgPrefix} no violations returned`);
            }
            if (violations.length > 0) {
                throw new Error(violations.join('\n\n'));
            }
        })
        .catch((e) => {
            throw new Error(`${axeErrMsgPrefix} ${e}`);
        });
}
