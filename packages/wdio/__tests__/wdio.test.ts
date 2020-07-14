/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as axe from 'axe-core';
import { assertAccessible, axeVersion, getAxeVersion, loadAxe, runAxe } from '../src/wdio';
import { htmlFileWithA11yIssues, htmlFileWithNoA11yIssues } from '@sa11y/test-utils';
import { A11yError } from '@sa11y/format';
import { axeRuntimeExceptionMsgPrefix } from '@sa11y/common';

const numA11yIssues = 6;

/**
 * Test util function to get violations from given html file
 */
async function getViolationsHtml(htmlFilePath: string): Promise<axe.Result[]> {
    await browser.url(htmlFilePath);
    return runAxe(browser);
}

async function checkA11yError(expectNumA11yIssues = 0): Promise<void> {
    // TODO (debug): setting expected number of assertions doesn't seem to be working correctly in mocha
    //  https://webdriver.io/docs/assertion.html
    //  Check mocha docs: https://mochajs.org/#assertions
    //  Checkout Jasmine ? https://webdriver.io/docs/frameworks.html
    expect.assertions(100); // still passes ???

    // TODO (debug): Not able to get the expect().toThrow() to work - hence using the longer try.. catch alternative
    // expect(async () => await assertAccessible()).toThrow();
    let err: Error = new Error();
    try {
        await assertAccessible();
    } catch (e) {
        err = e;
    }

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

describe('integration test axe with WebdriverIO', () => {
    it('should load test page', async () => {
        await browser.url(htmlFileWithNoA11yIssues);
        expect(await browser.getTitle()).toBe('Test Page');
    });

    it('should inject axe', async () => {
        await browser.url(htmlFileWithNoA11yIssues);

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
    // Note: "expect"s are in the helper method "checkA11yError"
    /* eslint-disable jest/expect-expect */
    it('should throw no error for html with no a11y issues', async () => {
        await browser.url(htmlFileWithNoA11yIssues);
        await checkA11yError(0);
    });

    it('should throw error for html with a11y issues', async () => {
        await browser.url(htmlFileWithA11yIssues);
        await checkA11yError(numA11yIssues);
    });

    // Skipped till there is a solution to https://github.com/webdriverio/webdriverio/issues/5597
    it.skip('should work in sync mode as well', () => {
        const sync = require('@wdio/sync').default;
        return sync(() => {
            browser.url(htmlFileWithA11yIssues);
            checkA11yError(numA11yIssues);
        });
    });
    /* eslint-enable jest/expect-expect */
});
