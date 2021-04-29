/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { AxeResults } from '@sa11y/common';

/**
 * Remap, filter info from axe result
 */
// class A11yResult {
//     constructor(AxeResult) {}
// }

// type RuleIdCssSelectorMap = Map<RuleID, CssSelectors>;

/**
 * Consolidate unique a11y violations by removing duplicates.
 */
export class ConsolidatedResults {
    // TODO (refactor): Is there any advantage to extending built-in Set/Map ?
    // TODO (refactor): Would it be more efficient to recast into a Map struct?
    // static consolidated = new Map<RuleIdCssSelectorMap, AxeResult>();
    static consolidated: AxeResults = [];

    /**
     * Adds given a11y results to a consolidated list if they are not already present
     * @returns results that have not been added earlier
     */
    static add(results: AxeResults): AxeResults {
        const newResults: AxeResults = [];
        for (const result of results) {
            let unique = true;
            for (const consolidatedResult of this.consolidated) {
                if (
                    result.id === consolidatedResult.id &&
                    result.nodes.length === consolidatedResult.nodes.length &&
                    result.nodes.filter((selector) => !consolidatedResult.nodes.includes(selector)).length === 0
                )
                    unique = false;
            }
            if (unique) newResults.push(result);
        }
        this.consolidated.push(...newResults);
        return newResults;
    }
}
