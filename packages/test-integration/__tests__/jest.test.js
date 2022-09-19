/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {
    beforeEachSetup,
    checkA11yErrorFunc,
    domWithA11yIssues,
    domWithNoA11yIssues,
    domWithVisualA11yIssues,
} from '@sa11y/test-utils';
import { registerSa11yMatcher } from '@sa11y/jest';

beforeAll(registerSa11yMatcher);

beforeEach(beforeEachSetup);

describe('integration test @sa11y/jest', () => {
    it('should have a11y matchers working with setup in jest.config.js', async () => {
        expect(expect.toBeAccessible).toBeDefined();
        document.body.innerHTML = domWithNoA11yIssues;
        await expect(document).toBeAccessible();
    });

    it('should throw error for inaccessible dom', async () => {
        document.body.innerHTML = domWithA11yIssues;
        await checkA11yErrorFunc(() => expect(document).toBeAccessible());
    });

    it('will not throw error for audio video color-contrast', async () => {
        document.body.innerHTML = domWithVisualA11yIssues;
        // Even though the dom has a11y issues w.r.t color contrast and audio/video
        //  elements etc, Jest/JSDOM will not able to detect them
        await expect(document).toBeAccessible();
    });
});
