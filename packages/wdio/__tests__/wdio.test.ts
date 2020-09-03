/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as axe from 'axe-core';
import { assertAccessible, assertAccessibleSync, axeVersion, getAxeVersion, loadAxe, runAxe } from '../src/wdio';
import { htmlFileWithA11yIssues, htmlFileWithNoA11yIssues } from '@sa11y/test-utils';
import { A11yError } from '@sa11y/format';
import { axeRuntimeExceptionMsgPrefix } from '@sa11y/common';

import * as sync from '@wdio/sync';

const numA11yIssues = 6;

/**
 * Test util function to get violations from given html file
 */
async function getViolationsHtml(htmlFilePath: string): Promise<axe.Result[]> {
    browser.url(htmlFilePath);
    return runAxe(browser);
}

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

async function checkAccessible(expectNumA11yIssues = 0): Promise<void> {
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
        await assertAccessible();
    } catch (e) {
        err = e as Error;
    }
    checkA11yError(err, expectNumA11yIssues);
}

function checkAccessibleSync(expectNumA11yIssues = 0): void {
    let err: Error = new Error();
    // Note: WDIO doesn't provide snapshot feature to verify error thrown.
    //  Hence the longer try .. catch alternative
    try {
        assertAccessibleSync();
    } catch (e) {
        err = e as Error;
    }
    checkA11yError(err, expectNumA11yIssues);
}

describe('integration test axe with WebdriverIO', () => {
    it('should load test page', async () => {
        browser.url(htmlFileWithNoA11yIssues);
        expect(await browser.getTitle()).toBe('Test Page');
    });

    it('should inject axe', async () => {
        browser.url(htmlFileWithNoA11yIssues);

        // Before loading axe, get version should not be defined
        expect(await getAxeVersion(browser)).toBeFalsy();
        expect(axe.source.length).toBeGreaterThan(0);
        await loadAxe(browser);

        // After loading axe, get version should work as expected
        expect(await getAxeVersion(browser)).toBe(axeVersion);
    });

    it('should get violations', async () => {
        expect(await getViolationsHtml(htmlFileWithNoA11yIssues)).toHaveLength(0);
        expect(await getViolationsHtml(htmlFileWithA11yIssues)).toHaveLength(numA11yIssues);
    });
});

describe('integration test @sa11y/wdio with WebdriverIO', () => {
    // Note: "expect"s are in the helper method "checkAccessible"
    /* eslint-disable jest/expect-expect */
    it('should throw no error for html with no a11y issues', async () => {
        browser.url(htmlFileWithNoA11yIssues);
        await checkAccessible(0);
    });

    it('should throw error for html with a11y issues', async () => {
        browser.url(htmlFileWithA11yIssues);
        await checkAccessible(numA11yIssues);
    });
    /* eslint-enable jest/expect-expect */

    it('should throw no error for html with no a11y issues in sync mode', () => {
        // TODO (chore): Raise issue with WebdriverIO - 'sync' missing 'default' in ts def
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
        return sync.default(() => {
            browser.url(htmlFileWithNoA11yIssues);
            expect(() => assertAccessibleSync()).not.toThrow();
            checkAccessibleSync(0);
        });
    });

    it('should throw error for html with a11y issues in sync mode', () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
        return sync.default(() => {
            browser.url(htmlFileWithA11yIssues);
            expect(() => assertAccessibleSync()).toThrow();
            checkAccessibleSync(numA11yIssues);
        });
    });
});
