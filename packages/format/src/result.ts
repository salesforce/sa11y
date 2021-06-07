/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { AxeResults } from '@sa11y/common';
import { NodeResult, Result } from 'axe-core';
import * as axe from 'axe-core';
import { WcagMetadata } from './wcag';

const defaultImpact = 'minor'; // if impact is undefined
// Helper object to sort violations by impact order
const impactOrder = {
    critical: 1,
    serious: 2,
    moderate: 3,
    minor: 4,
};

/**
 * Filtered a11y result containing essential info about the a11y failure
 */
export class A11yResult {
    // Note: This is serialized as part of A11yError and read back from the
    // custom test results processor to consolidate/transform a11y errors.
    // So it can only have members that can be deserialized back easily
    // i.e. no object refs etc.
    public readonly id: string;
    public readonly selectors: string;
    public readonly html: string;
    public readonly description: string;
    public readonly helpUrl: string;
    public readonly wcag: string;
    // public readonly testPath: string;
    // public readonly testNames: string[];

    /**
     * Normalize and flatten a11y violations from Axe
     */
    static convert(violations: AxeResults): A11yResult[] {
        return A11yResult.sort(violations).flatMap((violation) => {
            return violation.nodes.map((node) => {
                return new A11yResult(violation, node);
            });
        });
    }

    /**
     * Sorts give a11y violations from axe in order of impact
     */
    static sort(violations: AxeResults): AxeResults {
        return violations.sort((a, b) => {
            const aImpact = impactOrder[a.impact || defaultImpact];
            const bImpact = impactOrder[b.impact || defaultImpact];
            if (aImpact < bImpact) return -1;
            if (aImpact > bImpact) return 1;
            return 0;
        });
    }

    constructor(violation: Result, node: NodeResult) {
        this.id = violation.id;
        this.description = violation.help;
        this.wcag = new WcagMetadata(violation.tags).toString();
        this.helpUrl = violation.helpUrl.split('?')[0];
        this.selectors = node.target.sort().join('; ');
        this.html = node.html;
    }
}

/**
 * Consolidate unique a11y violations by removing duplicates.
 */
export class ConsolidatedResults {
    static a11yResults: Record<string, A11yResult[]> = {};
    static consolidatedMap = new Map<string, axe.Result>();

    static clear(): void {
        this.consolidatedMap.clear();
    }

    /**
     * Convert and consolidate given a11y results based on given key
     */
    // TODO(refactor): Merge with ConsolidatedResults.add()
    static convert(results: AxeResults, key = ''): void {
        // const a11yResults = ConsolidatedResults.a11yResults;
        // // Initialize if key doesn't exist
        // if (!Array.isArray(a11yResults[key])) a11yResults[key] = [];
        // for (const result of results) {
        //     for (const node of result.nodes) {
        //         a11yResults[key].push(<A11yResult>{
        //             // TODO (refactor): Reuse A11yResult for A11yError.format()
        //             id: result.id,
        //             // Note: Use a separator that cannot be part of a CSS selector
        //             selectors: node.target.sort().join('; '),
        //             description: result.help,
        //             helpUrl: result.helpUrl.split('?')[0],
        //             impact: result.impact,
        //             // TODO : Add wcag level or best practice tag to output ?
        //             // const criteria = violation.tags.filter((tag) => tag.startsWith('wcag2a') || tag.startsWith('best'));
        //         });
        //     }
        // }
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
