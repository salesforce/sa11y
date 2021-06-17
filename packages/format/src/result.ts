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
 * Filtered a11y result containing selected and normalized info about the a11y failure
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
    public readonly summary: string;
    public readonly key: string; // Represent a key with uniquely identifiable info

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
        // TODO (code cov): Add test data where failure summary is missing
        /* istanbul ignore next */
        this.summary = node.failureSummary || '';
        this.key = `${this.id}--${this.selectors}`;
    }
}

/**
 * Consolidate unique a11y violations by removing duplicates.
 */
export class ConsolidatedResults {
    // static a11yResults: Record<string, A11yResult[]> = {};
    static a11yResults = new Map<string, string[]>();
    static consolidatedMap = new Map<string, axe.Result>();

    static clear(): void {
        this.consolidatedMap.clear();
        this.a11yResults.clear();
    }

    /**
     * Consolidate given a11y results based on given key (test scope)
     *  and return new results that are not already present
     */
    // TODO(refactor): Merge with ConsolidatedResults.add()
    static consolidate(results: A11yResult[], key = ''): A11yResult[] {
        const a11yResults = ConsolidatedResults.a11yResults;
        const existingResults = a11yResults.get(key) || [];
        if (existingResults.length === 0) a11yResults.set(key, existingResults);
        return results.filter((result) => {
            if (!existingResults.includes(result.key)) {
                existingResults.push(result.key);
                return result;
            }
        });
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
