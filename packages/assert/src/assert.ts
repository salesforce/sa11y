/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as axe from 'axe-core';
import { A11yConfig, extended } from '@sa11y/preset-rules';
import { a11yResultsFormatter, Formatter } from '@sa11y/format';
import { axeRuntimeExceptionMsgPrefix } from '@sa11y/common';

/**
 * Type def for context that can be checked for accessibility.
 * Limiting to this subset from all options supported by axe for ease of use and maintenance.
 */
export type a11yCheckableContext = Document | HTMLElement;

/**
 * Checks DOM for accessibility issues and throws an error if violations are found.
 * @param context - DOM or HTMLElement to be tested for accessibility
 * @param rules - A11yConfig preset rule to use, defaults to extended
 * @param formatter - Function to format a11y violations. Passing null will format using JSON stringify.
 * @throws error - with the accessibility issues found, does not return any value
 * */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function assertAccessible(
    context: a11yCheckableContext = document,
    rules: A11yConfig = extended,
    formatter: Formatter = a11yResultsFormatter
) {
    let violations;
    try {
        const results = await axe.run(context as axe.ElementContext, rules as axe.RunOptions);
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
