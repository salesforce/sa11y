/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { domWithA11yIssues } from '@sa11y/test-utils';
import { ConsolidatedResults } from '../src/result';
import { getA11yError } from './format.test';

describe('a11y results post-processing', () => {
    it('should consolidate violations', async () => {
        const a11yError = await getA11yError(domWithA11yIssues);
        const violations = a11yError.violations;
        expect(violations.length).toBeGreaterThan(0);
        expect(ConsolidatedResults.add(violations)).toHaveLength(violations.length);
        // Shouldn't add again for the same violations
        expect(ConsolidatedResults.add(violations)).toHaveLength(0);
        // Shouldn't add for duplicated violations
        expect(ConsolidatedResults.add(violations.concat(violations))).toHaveLength(0);
        // Shouldn't add for individual violations
        const violation = violations.pop();
        expect(ConsolidatedResults.add([violation])).toHaveLength(0);
        // Shouldn't add for modified violations (after a result is removed)
        expect(ConsolidatedResults.add(violations)).toHaveLength(0);
        // Should add a modified result
        const newViolation = { ...violation }; // Create a copy
        newViolation.id = 'nonExistentID';
        expect(ConsolidatedResults.add([newViolation])).toHaveLength(1);
        expect(ConsolidatedResults.add([newViolation])).toHaveLength(0);
    });
});
