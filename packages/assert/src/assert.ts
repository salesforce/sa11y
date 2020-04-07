/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import axe, { ElementContext, RunOptions } from 'axe-core';
import { extended } from '@sa11y/preset-rules';
import { A11yConfig } from '@sa11y/preset-rules';
import { Formatter, a11yResultsFormatter } from '@sa11y/format';

// Error message prefix for runtime exceptions when running axe
// TODO (refactor): Should this be exported? Can private variables be imported in tests?
//  Search for es6 module import version of https://www.npmjs.com/package/rewire
export const axeRuntimeExceptionMsgPrefix = 'Error running accessibility checks using axe:';

/**
 * Checks DOM for accessibility issues and throws an error if violations are found.
 * @param dom - DOM to be tested for accessibility
 * @param rules - A11yConfig preset rule to use, defaults to extended
 * @param formatter - Function to format a11y violations. Passing null will format using JSON stringify.
 * @throws error - with the accessibility issues found
 * */
export async function assertAccessible(
    dom: Document = document,
    rules: A11yConfig = extended,
    formatter: Formatter = a11yResultsFormatter
) {
    let violations;
    try {
        const results = await axe.run(dom as ElementContext, rules as RunOptions);
        violations = results.violations;
    } catch (e) {
        throw new Error(`${axeRuntimeExceptionMsgPrefix} ${e}`);
    }
    if (violations.length > 0) {
        // TODO (improvement): Add run-time type check for Formatter interface ?
        const formattedViolations: string = formatter ? formatter(violations) : JSON.stringify(violations);
        throw new Error(formattedViolations);
    }
}
