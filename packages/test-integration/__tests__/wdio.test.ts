/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { assertAccessibleSync, Options } from '@sa11y/wdio';
import {
    a11yIssuesCount,
    htmlFileWithA11yIssues,
    htmlFileWithNoA11yIssues,
    htmlFileWithVisualA11yIssues,
} from '@sa11y/test-utils';
import { axeRuntimeExceptionMsgPrefix } from '@sa11y/common';
import { A11yError } from '@sa11y/format';

// TODO (chore): Raise issue with WebdriverIO - 'sync' missing 'default' in ts def
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-var-requires
const sync: CallableFunction = require('@wdio/sync').default;

// TODO(refactor): De-dupe with packages/wdio/__tests__/wdio.test.ts
//  Can't move to test-utils due to cyclic dep. Can't export from test module.
function checkA11yError(err: Error, expectNumA11yIssues = 0): void {
    expect(err).toBeTruthy();
    expect(err.message).not.toContain(axeRuntimeExceptionMsgPrefix);

    if (expectNumA11yIssues > 0) {
        expect(err).not.toStrictEqual(new Error());
        expect(err.toString()).toContain(`${expectNumA11yIssues} ${A11yError.errMsgHeader}`);
    } else {
        expect(err).toStrictEqual(new Error());
        expect(err.toString()).not.toContain(A11yError.errMsgHeader);
    }
}

// TODO(refactor): De-dupe with packages/wdio/__tests__/wdio.test.ts
//  Can't move to test-utils due to cyclic dep. Can't export from test module.
function checkAccessibleSync(expectNumA11yIssues = 0, options: Partial<Options> = {}): void {
    let err: Error = new Error();
    // Note: WDIO doesn't provide snapshot feature to verify error thrown.
    //  Hence the longer try .. catch alternative
    try {
        assertAccessibleSync(options);
    } catch (e) {
        err = e as Error;
    }
    checkA11yError(err, expectNumA11yIssues);
}

// TODO(refactor): Switch to using sa11y API via browser commands for this test module
describe('integration test @sa11y/wdio in sync mode', () => {
    /* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, jest/expect-expect */
    it('should throw error for html with a11y issues', () => {
        return sync(() => {
            void browser.url(htmlFileWithA11yIssues);
            checkAccessibleSync(a11yIssuesCount);
        });
    });

    it('should not throw error for html with no a11y issues', () => {
        return sync(() => {
            void browser.url(htmlFileWithNoA11yIssues);
            checkAccessibleSync(0);
        });
    });

    it('should throw error for html with visual a11y issues', () => {
        return sync(() => {
            void browser.url(htmlFileWithVisualA11yIssues);
            checkAccessibleSync(2);
        });
    });
    /* eslint-enable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, jest/expect-expect */
});
