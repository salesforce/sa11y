/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { AxeResults } from '@sa11y/common';
import { NodeResult, Result, CheckResult } from 'axe-core';
import { priorities, wcagLevels, WcagMetadata } from '@sa11y/preset-rules';

const defaultImpact = 'minor'; // if impact is undefined
const formatSpacing = '\t'.repeat(6);
// Helper object to sort violations by impact order
const impactOrder = {
    critical: 1,
    serious: 2,
    moderate: 3,
    minor: 4,
};

export class A11yResults {
    private static consolidated = new Map<string, string[]>();

    /**
     * Clear accumulated consolidated results
     */
    static clear(): void {
        this.consolidated.clear();
    }

    /**
     * Consolidate given a11y results based on the given key (test scope)
     * and return new results that are not already present
     */
    static add(results: A11yResult[], key = ''): A11yResult[] {
        const existingResults = this.consolidated.get(key) || [];
        if (existingResults.length === 0) this.consolidated.set(key, existingResults);
        return results.filter((result) => {
            if (!existingResults.includes(result.key)) {
                existingResults.push(result.key);
                return result;
            }
        });
    }

    /**
     * Sort a11y violations from axe in order of impact
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

    /**
     * Normalize and flatten a11y violations from Axe
     */
    static convert(violations: AxeResults): A11yResult[] {
        return A11yResults.sort(violations).flatMap((violation) => {
            return violation.nodes.map((node) => {
                return new A11yResult(violation, node);
            });
        });
    }
}

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
    public readonly ancestry: string;
    public readonly any: string;
    public readonly all: string;
    public readonly none: string;
    public readonly relatedNodeAny: string;
    public readonly relatedNodeAll: string;
    public readonly relatedNodeNone: string;
    private readonly wcagData: WcagMetadata; // Used to sort results

    constructor(violation: Result, node: NodeResult) {
        this.id = violation.id;
        this.description = violation.description;
        this.wcagData = new WcagMetadata(violation);
        this.wcag = this.wcagData.toString();
        this.helpUrl = violation.helpUrl.split('?')[0];
        this.selectors = node.target.sort().join('; ');
        this.html = node.html;
        // TODO (code cov): Add test data where failure summary is missing
        /* istanbul ignore next */
        this.summary = node.failureSummary || '';
        this.key = `${this.id}--${this.selectors}`;
        this.ancestry = (node.ancestry?.flat(Infinity) ?? []).join('\n');
        this.any = node.any?.map((item) => `${formatSpacing}• ${item.message}`).join('\n');
        this.all = node.all?.map((item) => `${formatSpacing}• ${item.message}`).join('\n');
        this.none = node.none?.map((item) => `${formatSpacing}• ${item.message}`).join('\n');
        this.relatedNodeAny = this.formatRelatedNodes(node.any);
        this.relatedNodeAll = this.formatRelatedNodes(node.all);
        this.relatedNodeNone = this.formatRelatedNodes(node.none);
    }

    /**
     * Sort results by Priority and WCAG Level
     */
    static sort(results: A11yResult[]): A11yResult[] {
        return results.sort((a, b) => {
            const priorityA = priorities.indexOf(a.wcagData.priority);
            const priorityB = priorities.indexOf(b.wcagData.priority);
            const wcagLevelA = wcagLevels.indexOf(a.wcagData.wcagLevel);
            const wcagLevelB = wcagLevels.indexOf(b.wcagData.wcagLevel);
            return priorityA - priorityB || wcagLevelA - wcagLevelB;
        });
    }
    formatRelatedNodes(node: CheckResult[]) {
        return node
            ?.map((item) =>
                item.relatedNodes && item.relatedNodes.length > 0
                    ? item.relatedNodes.map((relatedNode) => `${formatSpacing}• ${relatedNode.html}`).join('\n')
                    : null
            )
            .filter(Boolean)
            .join('\n');
    }
}

/**
 * Adds WCAG Success Criteria Info to result violations
 * @param results - Array of Axe results
 */
export function appendWcag(results: AxeResults) {
    for (const violation of results) {
        const wcagMetadata = new WcagMetadata(violation);
        violation.tags.push(wcagMetadata.toString());
    }
}
