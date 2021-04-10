/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { AxeResults, ExceptionList } from '@sa11y/common';

/**
 * Filter a11y violations from axe based on given {@link ExceptionList}
 * @param violations - List of violations found with axe
 * @param exceptionList - {@link ExceptionList} of map of rule to corresponding css targets that needs to be filtered from a11y results
 */
export function exceptionListFilter(violations: AxeResults, exceptionList: ExceptionList = {}): AxeResults {
    const exceptionRules = Object.keys(exceptionList);
    if (exceptionRules.length === 0) return violations;

    const filteredViolations: AxeResults = [];

    for (const violation of violations) {
        if (!exceptionRules.includes(violation.id)) {
            filteredViolations.push(violation);
        } else {
            for (const result of violation.nodes) {
                const filteredResults = result.target.filter(
                    (cssSelector) => !exceptionList[violation.id].includes(cssSelector)
                );
                if (filteredResults.length > 0) {
                    filteredViolations.push(violation);
                }
            }
        }
    }

    return filteredViolations;
}
