/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Result } from 'axe-core';

/**
 * Filter to post-process a11y results from axe
 */
export interface Filter {
    (violations: Result[]): Result[];
}

// TODO (refactor): constrain rule id to known rule ids e.g using string literal, keyof, in etc
//  e.g. https://stackoverflow.com/a/54061487
// const ruleIDs = getRules().map((ruleObj) => ruleObj.ruleId);
// type ruleID = keyof ruleIDs;
// type ruleID = typeof ruleIDs[number];
type ruleID = string;
type cssSelectors = string[];

/**
 * Exception list of map of rule to corresponding css targets that needs to be filtered from a11y results.
 */
type exceptionList = Record<ruleID, cssSelectors>;

export function exceptionListFilter(violations: Result[], exceptionList: exceptionList = {}): Result[] {
    // TODO (refactor): Use map, filter instead of for loops? without compromising readability/debugging-ability
    // return violations.filter((violation) =>
    //     Object.keys(exceptionList).includes(violation.id)
    //         ? !violation.nodes.filter(
    //               (result) => !result.target.filter((cssSelector) => !exceptionList[violation.id].includes(cssSelector))
    //           )
    //         : true
    // );

    const filteredViolations: Result[] = [];

    for (const violation of violations) {
        for (const [ruleID, cssSelectors] of Object.entries(exceptionList)) {
            if (violation.id !== ruleID) {
                filteredViolations.push(violation);
            } else {
                for (const result of violation.nodes) {
                    const filteredResults = result.target.filter((cssSelector) => !cssSelectors.includes(cssSelector));
                    // debugger;
                    if (filteredResults.length > 0) {
                        filteredViolations.push(violation);
                    }
                }
            }
        }
    }

    return filteredViolations;
}
