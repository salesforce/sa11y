/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as axe from 'axe-core';
import { A11yConfig, recommended } from '@sa11y/preset-rules';
import { A11yError } from '@sa11y/format';
import { AxeResults, getViolations } from '@sa11y/common';

/**
 * Context that can be checked for accessibility: Document, Node or CSS selector.
 * Limiting to subset of options supported by axe for ease of use and maintenance.
 */
export type A11yCheckableContext = Document | Node | string;

/**
 * Get list of a11y violations for given element and ruleset
 * @param context - DOM or HTML Node to be tested for accessibility
 * @param rules - A11yConfig preset rule to use, defaults to recommended
 * @returns {@link AxeResults} - list of accessibility issues found
 */
export async function getViolationsJSDOM(
    context: A11yCheckableContext = document,
    rules: A11yConfig = recommended
): Promise<AxeResults> {
    return await getViolations(async () => {
        const results = await axe.run(context as axe.ElementContext, rules as axe.RunOptions);
        return results.violations;
    });
}

/**
 * Checks DOM for accessibility issues and throws an error if violations are found.
 * @param context - DOM or HTML Node to be tested for accessibility
 * @param rules - A11yConfig preset rule to use, defaults to recommended
 * @throws error - with the accessibility issues found, does not return any value
 * */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function assertAccessible(context: A11yCheckableContext = document, rules: A11yConfig = recommended) {
    const violations = await getViolationsJSDOM(context, rules);

    A11yError.checkAndThrow(violations);
}
