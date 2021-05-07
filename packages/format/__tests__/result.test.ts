/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { ConsolidatedResults } from '../src';
import { getViolations } from './format.test';
import { AxeResults } from '@sa11y/common';

let violations: AxeResults = [];
beforeAll(async () => {
    violations = await getViolations();
});
beforeEach(() => ConsolidatedResults.clear());

describe('a11y results post-processing', () => {
    it('should consolidate violations', () => {
        expect(violations.length).toBeGreaterThan(0);
        expect(ConsolidatedResults.add(violations)).toHaveLength(violations.length);
    });

    it('should not add the same violations again', () => {
        expect(ConsolidatedResults.add(violations)).toHaveLength(violations.length);
        expect(ConsolidatedResults.add(violations)).toHaveLength(0);
        expect(ConsolidatedResults.add(violations.concat(violations))).toHaveLength(0);
    });

    it('should not add a single duplicate violation', () => {
        expect(ConsolidatedResults.add(violations)).toHaveLength(violations.length);
        const violation = violations.pop();
        // Shouldn't add an individual duplicate violation
        expect(ConsolidatedResults.add([violation])).toHaveLength(0);

        // Shouldn't add modified violations (after a result is removed)
        expect(ConsolidatedResults.add(violations)).toHaveLength(0);

        // Should add the result copy with diff id
        const newViolationId = { ...violation }; // Create a copy
        newViolationId.id = 'nonExistentID';
        expect(ConsolidatedResults.add([newViolationId])).toHaveLength(1);
        expect(ConsolidatedResults.add([newViolationId])).toHaveLength(0);

        // Should add the result copy with diff CSS selector
        expect(violation.nodes[0].target.length).toBeGreaterThan(0);
        const newViolationCss = JSON.parse(JSON.stringify(violation)) as typeof violation; // Create a copy
        // Copy should not get added as it is identical
        expect(ConsolidatedResults.add([newViolationCss])).toHaveLength(0);
        // Changing a CSS selector in the copy should add the violation
        newViolationCss.nodes[0].target.push('nonExistentCssSelector');
        expect(ConsolidatedResults.add([newViolationCss])).toHaveLength(1);
        expect(ConsolidatedResults.add([newViolationCss])).toHaveLength(0);
    });
});
