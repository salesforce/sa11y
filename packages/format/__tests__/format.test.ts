/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as axe from 'axe-core';
import { a11yResultsFormatter } from '..';
import { beforeEachSetup, domWithA11yIssues } from '@sa11y/test-utils';

beforeEach(beforeEachSetup);

describe('a11y Results Formatter', () => {
    it('should format a11y issues as expected', async () => {
        document.body.innerHTML = domWithA11yIssues;
        await axe.run(document).then((results) => {
            expect(results).toBeDefined();
            expect(a11yResultsFormatter(results.violations)).toMatchSnapshot();
        });
    });
});
