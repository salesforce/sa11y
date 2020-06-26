/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as axe from 'axe-core';

export const axeRuntimeExceptionMsgPrefix = 'Error running accessibility checks using axe:';

/**
 * Interface that represents a function that runs axe and returns violations
 */
interface AxeRunner {
    (): Promise<axe.Result[]>;
}

/**
 * Get violations by running axe with given function
 * @param axeRunner - function satisfying AxeRunner interface
 */
export async function getViolations(axeRunner: AxeRunner): Promise<axe.Result[]> {
    let violations;
    try {
        violations = await axeRunner();
    } catch (e) {
        throw new Error(`${axeRuntimeExceptionMsgPrefix} ${e}`);
    }
    return violations;
}
