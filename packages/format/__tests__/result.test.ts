/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { A11yResult, A11yResults, appendWcag } from '../src';
import { getViolations } from './format.test';
import { AxeResults } from '@sa11y/common';
import { NodeResult, Result } from 'axe-core';
import { expect } from '@jest/globals';

const a11yIssues = [
    { impact: undefined },
    { impact: undefined },
    { impact: 'moderate' },
    { impact: 'minor' },
    { impact: 'critical' },
    { impact: 'critical' },
] as AxeResults;

let violations: AxeResults = [];
let a11yResults: A11yResult[] = [];
beforeAll(async () => {
    violations = await getViolations();
    a11yResults = A11yResults.convert(violations);
});
beforeEach(() => A11yResults.clear());

describe('a11y result', () => {
    it('should be serializable', () => {
        const deserializeResults = (a11yResults) => JSON.parse(JSON.stringify(a11yResults)) as A11yResult[];
        const a11yResults = A11yResults.convert(violations);
        expect(deserializeResults(a11yResults)).toEqual(a11yResults);

        // Add a non-serializable property to A11yResult (E.g. a function)
        a11yResults.map(
            (a11yResult) =>
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore TS2339: Property 'foo' does not exist on type 'A11yResult'.
                (a11yResult.foo = () => {
                    return 'foo';
                })
        );
        expect(deserializeResults(a11yResults)).not.toEqual(a11yResults);
    });

    it('should sort a11y issues by impact', () => {
        A11yResults.sort(a11yIssues);
        expect(a11yIssues[0].impact).toBe('critical');
        expect(a11yIssues[1].impact).toBe('critical');
        expect(a11yIssues[2].impact).toBe('moderate');
        expect(a11yIssues[3].impact).toBeUndefined(); // Sort by "defaultImpact"
        expect(a11yIssues[4].impact).toBeUndefined();
        expect(a11yIssues[5].impact).toBe('minor');
    });

    it('should sort a11y results by priority, WCAG level', () => {
        // Create test data with rule ids of different priority
        const rules = [
            'identical-links-same-purpose', // P3, AAA
            'autocomplete-valid', // P2, AA
            'audio-caption', // P1, A
        ];
        const expectedSortedRules = [...rules].reverse();
        const a11yResults = A11yResults.convert(
            rules.map(
                (rule) =>
                    ({
                        id: rule,
                        helpUrl: 'foo',
                        nodes: [{ target: ['foo'], html: 'bar', failureSummary: 'baz' } as NodeResult],
                    } as Result)
            )
        );

        // baseline check before sorting
        a11yResults.forEach((result, index) => expect(result.id).toEqual(rules[index]));

        // Sort and check if they have been rearranged by priority and WCAG level
        A11yResult.sort(a11yResults).forEach((result, index) => expect(result.id).toEqual(expectedSortedRules[index]));
    });

    it('should consolidate violations', () => {
        expect(a11yResults.length).toBeGreaterThan(0);
        expect(A11yResults.add(a11yResults)).toHaveLength(a11yResults.length);
    });

    it('should not add the same violations again', () => {
        expect(A11yResults.add(a11yResults)).toHaveLength(a11yResults.length);
        expect(A11yResults.add(a11yResults)).toHaveLength(0);
        expect(A11yResults.add(a11yResults.concat(a11yResults))).toHaveLength(0);
    });

    it('should not add a single duplicate violation', () => {
        expect(A11yResults.add(a11yResults)).toHaveLength(a11yResults.length);
        const a11yResult = a11yResults[0];
        // Shouldn't add an individual duplicate violation
        expect(A11yResults.add([a11yResult])).toHaveLength(0);

        // Shouldn't add modified violations (after a result is removed)
        expect(A11yResults.add(a11yResults)).toHaveLength(0);

        // Should add the result copy with diff id
        const violation = violations[0];
        // base line check before modifying id, css
        const existingA11yResult = new A11yResult(violation, violation.nodes[0]);
        expect(A11yResults.add([existingA11yResult])).toHaveLength(0);

        // Create a copy with diff ID
        const newA11yResultId = new A11yResult({ ...violation, id: 'foo' }, violation.nodes[0]);
        expect(A11yResults.add([newA11yResultId])).toHaveLength(1);
        expect(A11yResults.add([newA11yResultId])).toHaveLength(0);

        // Should add the result copy with diff CSS selector
        const newA11yResultCss = new A11yResult(violation, { ...violation.nodes[0], target: ['bar'] });
        expect(A11yResults.add([newA11yResultCss])).toHaveLength(1);
        expect(A11yResults.add([newA11yResultCss])).toHaveLength(0);
    });

    it.each(['', 'foo', 'bar'])('should consolidate based on given key: %#', (key) => {
        expect(A11yResults.add(a11yResults, key)).toHaveLength(a11yResults.length);
        expect(A11yResults.add(a11yResults, key)).toHaveLength(0);
    });
    it('should handle empty nodes violations', () => {
        const violationWithoutNodes: AxeResults = [];
        violations.forEach((violation) => {
            violation.nodes = [];
            violationWithoutNodes.push(violation);
        });
        a11yResults = A11yResults.convert(violationWithoutNodes);
        expect(a11yResults).toHaveLength(violationWithoutNodes.length);
    });
});

describe('appendWcag', () => {
    it('should add WCAG metadata to each result', () => {
        appendWcag(violations);

        // Expect that WCAG metadata is added to each result
        expect(violations[0].tags).toContain('SA11Y-WCAG-SC2.4.2-P2');
        expect(violations[1].tags).toContain('SA11Y-WCAG-SC3.1.1-P2');
    });

    it('should handle results with no WCAG metadata', () => {
        appendWcag(violations);

        // Expect that no additional tags are added to results with no WCAG metadata
        expect(violations[0].tags).not.toContain('SA11Y-WCAG');
        expect(violations[1].tags).not.toContain('SA11Y-WCAG');
    });
});
