/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as axe from 'axe-core';

export const axeRuntimeExceptionMsgPrefix = 'Error running accessibility checks using axe:';

export const axeVersion: string | undefined = axe.version;

export type AxeResults = axe.Result[];

/**
 * Interface that represents a function that runs axe and returns violations
 */
interface AxeRunner {
    (): Promise<AxeResults>;
}

/**
 * A11yConfig defines options to run accessibility checks using axe specifying list of rules to test
 */
export interface A11yConfig extends axe.RunOptions {
    runOnly: {
        type: 'rule';
        values: string[];
    };
    resultTypes: ['violations'];
}

/**
 * Get violations by running axe with given function
 * @param axeRunner - function satisfying AxeRunner interface
 */
export async function getViolations(axeRunner: AxeRunner): Promise<AxeResults> {
    let violations;
    try {
        violations = await axeRunner();
    } catch (e) {
        throw new Error(`${axeRuntimeExceptionMsgPrefix} ${(e as Error).message}`);
    }
    return violations;
}
