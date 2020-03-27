/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import axe, { ElementContext, RunOptions } from 'axe-core';
// TODO (Fix): Figure out how to remove 'dist' from import path
import { extended } from '@sa11y/preset-rules/dist/extended';
import { AxeConfig } from '@sa11y/preset-rules/dist/axeConfig';

/**
 * Checks DOM for accessibility issues and throws an error if violations are found.
 * @param dom - DOM to be tested for accessibility
 * @param rules - AxeConfig preset rule to use, defaults to extended
 * @throws error - with the accessibility issues found
 * */
export function assertAccessible(dom: Document = document, rules: AxeConfig = extended): void {
    axe.run(dom as ElementContext, rules as RunOptions)
        .then((result) => {
            const violations = result.violations;
            if (violations.length > 0) throw new Error(violations.join());
        })
        .catch((e) => {
            throw new Error(`Error running accessibility checks using axe: ${e}`);
        });
}
