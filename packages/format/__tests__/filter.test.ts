/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { domWithA11yIssues } from '@sa11y/test-utils';
import * as axe from 'axe-core';
import { exceptionListFilter } from '../src';

let violations;

beforeAll(async () => {
    document.body.innerHTML = domWithA11yIssues;
    violations = await axe.run(document).then((results) => results.violations);
});

describe('a11y results filter', () => {
    it('should be setup with violations for test', () => {
        expect(violations).toMatchSnapshot();
    });

    it.each([violations, []])('should not filter results for empty exception list (with violations list at %#)', () => {
        expect(exceptionListFilter(violations)).toStrictEqual(violations);
    });

    it.each([{ nonExistingRule: ['foo', 'bar'] }, { bypass: ['html5'] }, { bypassFoo: ['html'] }])(
        'should not filter results for non-matching exception list %#',
        (exceptionList) => {
            expect(exceptionListFilter(violations, exceptionList)).toStrictEqual(violations);
        }
    );

    it('should filter results for matching exception list', () => {
        const filteredViolations = exceptionListFilter(violations, { bypass: ['html'] });
        // expect(filteredViolations).not.toStrictEqual(violations);
        expect(filteredViolations.map((violation) => violation.id)).not.toContain('bypass');
        expect(filteredViolations).toMatchSnapshot();
    });
});
