/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { AxeResults } from '@sa11y/common';
import { ImpactValue } from 'axe-core';
import * as axe from 'axe-core';

/**
 * Filtered a11y result containing essential info about the a11y failure
 */
export type A11yResult = {
    id: string;
    selectors: string;
    description: string;
    helpUrl: string;
    impact: ImpactValue;
    // TODO: Add WCAG levels to sort rule
    wcagVersion: number; // TODO: convert to enum
    wcagLevel: string; // TODO: convert to enum
    wcagSC: string;
    testPath: string;
    testNames: string[];
};

export type A11yResults = A11yResult[];

/**
 * Consolidate unique a11y violations by removing duplicates.
 */
export class ConsolidatedResults {
    // static consolidatedMap = new Map<string, A11yResult>();
    static consolidatedMap = new Map<string, axe.Result>();

    static clear(): void {
        this.consolidatedMap.clear();
    }

    static convert(results: AxeResults): A11yResults {
        const a11yResults: A11yResults = [];
        for (const result of results) {
            for (const node of result.nodes) {
                a11yResults.push(<A11yResult>{
                    // TODO (refactor): Reuse A11yResult for A11yError.format()
                    id: result.id,
                    // Note: Use a separator that cannot be part of a CSS selector
                    selectors: node.target.sort().join('; '),
                    description: result.help,
                    helpUrl: result.helpUrl.split('?')[0],
                    impact: result.impact,
                    // TODO : Add wcag level or best practice tag to output ?
                    // const criteria = violation.tags.filter((tag) => tag.startsWith('wcag2a') || tag.startsWith('best'));
                });
            }
        }
        return a11yResults;
    }

    /**
     * Adds given a11y results to a consolidated list if they are not already present
     * @returns results that have not been added earlier
     */
    static add(results: AxeResults): AxeResults {
        const newResults: AxeResults = [];
        for (const result of results) {
            for (const node of result.nodes) {
                const selectors = node.target.sort().join(';');
                const key = `${result.id}--${selectors}`;
                if (!this.consolidatedMap.has(key)) {
                    this.consolidatedMap.set(key, result);
                    // TODO (refactor): Store A11yResult with selected fields instead
                    //  AND reuse it to display formatted error message
                    newResults.push(result);
                }
            }
        }
        return newResults;
    }
}
