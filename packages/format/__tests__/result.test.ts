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
        expect(ConsolidatedResults.add(violations)).toHaveLength(0);
        expect(ConsolidatedResults.add(violations.concat(violations))).toHaveLength(0);
    });
});
