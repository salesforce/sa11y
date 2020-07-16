/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { beforeEachSetup, domWithA11yIssues } from '@sa11y/test-utils';
import * as axe from 'axe-core';
import { exceptionListFilter } from '../src';

let violations;

beforeAll(async () => {
    document.body.innerHTML = domWithA11yIssues;
    violations = await axe.run(document).then((results) => results.violations);
});

beforeEach(beforeEachSetup);

describe('a11y results filter', () => {
    it('should be setup with violations for test', () => {
        expect(violations).toMatchSnapshot();
    });

    it.each([violations, []])('should not filter results for empty exception list (with violations list at %#)', () => {
        expect(exceptionListFilter(violations, {})).toStrictEqual(violations);
    });

    it('should not filter results for non-matching exception list', () => {
        expect(exceptionListFilter(violations, { nonExistingRule: ['foo', 'bar'] })).toStrictEqual(violations);
    });

    it('should filter results for matching exception list', () => {
        expect(exceptionListFilter(violations, { bypass: ['html'] })).toStrictEqual(violations);
    });
});
