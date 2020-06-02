/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as axe from 'axe-core';
import { beforeEachSetup, domWithA11yIssues, domWithNoA11yIssues } from '@sa11y/test-utils';
import { A11yError } from '..';

beforeEach(beforeEachSetup);

describe('a11y Results Formatter', () => {
    it.each([domWithA11yIssues, domWithNoA11yIssues])(
        'should format a11y issues as expected with default options for dom %#',
        async (dom) => {
            document.body.innerHTML = dom;
            const violations = await axe.run(document).then((results) => results.violations);
            const a11yError = new A11yError(violations);
            expect(a11yError.format()).toMatchSnapshot();
        }
    );
});
