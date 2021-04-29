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
        // Should add a modified result
        const newViolation = { ...violation }; // Create a copy
        newViolation.id = 'nonExistentID';
        expect(ConsolidatedResults.add([newViolation])).toHaveLength(1);
        expect(ConsolidatedResults.add([newViolation])).toHaveLength(0);
    });
});
