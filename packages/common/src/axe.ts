/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as axe from 'axe-core';
import { resultGroups, RuleMetadata } from 'axe-core';

export const axeRuntimeExceptionMsgPrefix = 'Error running accessibility checks using axe:';

export const axeVersion: string | undefined = axe.version;

export type AxeResults = axe.Result[] | axeIncompleteResults[];

/**
 * Interface that represents a function that runs axe and returns violations
 */
interface AxeRunner {
    (): Promise<AxeResults>;
}
export interface axeIncompleteResults extends axe.Result {
    message?: string;
}

/**
 * A11yConfig defines options to run accessibility checks using axe specifying list of rules to test
 */
export interface A11yConfig extends axe.RunOptions {
    runOnly: {
        type: 'rule';
        values: string[];
    };
    resultTypes: resultGroups[];
}

/**
 * Get results by running axe with given function
 * @param axeRunner - function satisfying AxeRunner interface
 */
export async function getA11yResults(axeRunner: AxeRunner): Promise<AxeResults> {
    let results;
    try {
        results = await axeRunner();
    } catch (e) {
        throw new Error(`${axeRuntimeExceptionMsgPrefix} ${(e as Error).message}`);
    }
    return results;
}

/**
 * Get incomplete by running axe with given function
 * @param axeRunner - function satisfying AxeRunner interface
 */
export async function getIncomplete(axeRunner: AxeRunner): Promise<AxeResults> {
    return getA11yResults(axeRunner);
}

/**
 * Get violations by running axe with given function
 * @param axeRunner - function satisfying AxeRunner interface
 */
export async function getViolations(axeRunner: AxeRunner): Promise<AxeResults> {
    return getA11yResults(axeRunner);
}

/**
 * Return list of axe rules as a map of rule id to corresponding metadata
 */
export function getAxeRules(): Map<string, RuleMetadata> {
    const axeRules = new Map<string, RuleMetadata>();
    axe.getRules().forEach((rule) => axeRules.set(rule.ruleId, rule));
    return axeRules;
}
