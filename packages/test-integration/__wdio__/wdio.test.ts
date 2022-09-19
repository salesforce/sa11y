/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { assertAccessibleSync } from '@sa11y/wdio';
import {
    a11yIssuesCount,
    checkA11yErrorWdio,
    htmlFileWithA11yIssues,
    htmlFileWithNoA11yIssues,
    htmlFileWithVisualA11yIssues,
} from '@sa11y/test-utils';

// TODO (chore): Raise issue with WebdriverIO - 'sync' missing 'default' in ts def
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-var-requires
const sync: CallableFunction = require('@wdio/sync').default;

// TODO(refactor): Switch to using sa11y API via browser commands for this test module
describe('integration test @sa11y/wdio in sync mode', () => {
    /* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call*/
    it('should throw error for html with a11y issues', () => {
        return sync(() => {
            void browser.url(htmlFileWithA11yIssues);
            void checkA11yErrorWdio(assertAccessibleSync, a11yIssuesCount);
        });
    });

    it('should not throw error for html with no a11y issues', () => {
        return sync(() => {
            void browser.url(htmlFileWithNoA11yIssues);
            void checkA11yErrorWdio(assertAccessibleSync);
        });
    });

    it('should throw error for html with visual a11y issues', () => {
        return sync(() => {
            void browser.url(htmlFileWithVisualA11yIssues);
            void checkA11yErrorWdio(assertAccessibleSync, 1);
        });
    });
    /* eslint-enable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call */
});
