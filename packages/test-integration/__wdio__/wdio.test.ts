/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { assertAccessible } from '@sa11y/wdio';
import {
    a11yIssuesCount,
    htmlFileWithA11yIssues,
    htmlFileWithNoA11yIssues,
    htmlFileWithVisualA11yIssues,
} from '@sa11y/test-utils';
import { axeRuntimeExceptionMsgPrefix, errMsgHeader, WdioAssertFunction, WdioOptions } from '@sa11y/common';

async function checkA11yErrorWdio(
    assertFunc: WdioAssertFunction,
    expectNumA11yIssues = 0,
    options: Partial<WdioOptions> = {}
): Promise<void> {
    // TODO (debug): setting expected number of assertions doesn't seem to be working correctly in mocha
    //  https://webdriver.io/docs/assertion.html
    //  Check mocha docs: https://mochajs.org/#assertions
    //  Checkout Jasmine ? https://webdriver.io/docs/frameworks.html
    // expect.assertions(99999); // still passes ???

    // TODO (debug): Not able to get the expect().toThrow() with async functions to work with wdio test runner
    //  hence using the longer try.. catch alternative
    // expect(async () => await assertAccessible()).toThrow();
    let err: Error = new Error();
    try {
        await assertFunc(options);
    } catch (e) {
        err = e as Error;
    }
    expect(err).toBeTruthy();
    expect(err.message).not.toContain(axeRuntimeExceptionMsgPrefix);

    if (expectNumA11yIssues > 0) {
        expect(err).not.toEqual(new Error());
        expect(err.toString()).toContain(`${expectNumA11yIssues} ${errMsgHeader}`);
    } else {
        expect(err).toEqual(new Error());
        expect(err.toString()).not.toContain(errMsgHeader);
    }
}

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
