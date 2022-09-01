/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { assertAccessible } from '@sa11y/wdio';
import {
    a11yIssuesCount,
    checkA11yErrorWdio,
    htmlFileWithA11yIssues,
    htmlFileWithNoA11yIssues,
    htmlFileWithVisualA11yIssues,
} from '@sa11y/test-utils';

// TODO(refactor): Switch to using sa11y API via browser commands for this test module
describe('integration test @sa11y/wdio in async mode', () => {
    /* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call */
    it('should throw error for html with a11y issues', async () => {
        await browser.url(htmlFileWithA11yIssues);
        await checkA11yErrorWdio(async () => await assertAccessible(), a11yIssuesCount);
    });

    it('should not throw error for html with no a11y issues', async () => {
        await browser.url(htmlFileWithNoA11yIssues);
        await checkA11yErrorWdio(async () => await assertAccessible());
    });

    it('should throw error for html with visual a11y issues', async () => {
        await browser.url(htmlFileWithVisualA11yIssues);
        await checkA11yErrorWdio(async () => await assertAccessible(), 1);
    });
    /* eslint-enable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call */
});
