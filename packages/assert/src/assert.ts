/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as axe from 'axe-core';
import { A11yConfig, recommended } from '@sa11y/preset-rules';
import { A11yError } from '@sa11y/format';
import { getViolations } from '@sa11y/common';

/**
 * Type def for context that can be checked for accessibility.
 * Limiting to this subset from all options supported by axe for ease of use and maintenance.
 */
export type a11yCheckableContext = Document | HTMLElement;

/**
 * Checks DOM for accessibility issues and throws an error if violations are found.
 * @param context - DOM or HTMLElement to be tested for accessibility
 * @param rules - A11yConfig preset rule to use, defaults to recommended
 * @throws error - with the accessibility issues found, does not return any value
 * */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function assertAccessible(
    context: a11yCheckableContext = document,
    rules: A11yConfig = recommended
): never {
    const violations = await getViolations(async () => {
        const results = await axe.run(context as axe.ElementContext, rules as axe.RunOptions);
        return results.violations;
    });

    A11yError.checkAndThrow(violations);
}
