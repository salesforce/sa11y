/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import axe, { ElementContext, Result, RunOptions } from 'axe-core';
// TODO (Fix): Figure out how to remove 'dist' from import path
import { extended } from '@sa11y/preset-rules/dist/extended';
import { AxeConfig } from '@sa11y/preset-rules/dist/axeConfig';

// Error message prefix for runtime exceptions when running axe
// TODO (refactor): Should this be exported? Can private variables be imported in tests?
//  Search for es6 module import version of https://www.npmjs.com/package/rewire
export const axeRuntimeExceptionMsgPrefix = 'Error running accessibility checks using axe:';

function a11yResultsFormatter(violations: Result[]): string {
    return violations.join('\n\n');
}

/**
 * Checks DOM for accessibility issues and throws an error if violations are found.
 * @param dom - DOM to be tested for accessibility
 * @param rules - A11yConfig preset rule to use, defaults to extended
 * @throws error - with the accessibility issues found
 * */
export async function assertAccessible(dom: Document = document, rules: AxeConfig = extended) {
    let violations;
    try {
        const results = await axe.run(dom as ElementContext, rules as RunOptions);
        violations = results.violations;
    } catch (e) {
        throw new Error(`${axeRuntimeExceptionMsgPrefix} ${e}`);
    }
    if (violations.length > 0) {
        throw new Error(a11yResultsFormatter(violations));
    }
}
