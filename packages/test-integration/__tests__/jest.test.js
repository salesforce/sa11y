/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { beforeEachSetup, domWithA11yIssues, domWithNoA11yIssues } from '@sa11y/test-utils';

beforeEach(beforeEachSetup);

describe('integration test @sa11y/jest', () => {
    it('should have a11y matchers working with setup in jest.config.js', async () => {
        document.body.innerHTML = domWithNoA11yIssues;
        expect(expect.toBeAccessible).toBeDefined();
        await expect(document).toBeAccessible();
    });

    it('show throw error for inaccessible dom', async () => {
        expect.assertions(2);
        document.body.innerHTML = domWithA11yIssues;
        await expect(document)
            .toBeAccessible()
            .catch((e) => expect(e).toMatchSnapshot());
    });
});
