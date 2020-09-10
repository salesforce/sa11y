/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as axe from 'axe-core';
import { assertAccessible, assertAccessibleSync, getAxeVersion, loadAxe, Options, runAxe } from '../src/wdio';
import {
    domWithA11yIssuesBodyID,
    htmlFileWithA11yIssues,
    htmlFileWithNoA11yIssues,
    shadowDomID,
} from '@sa11y/test-utils';
import { A11yError } from '@sa11y/format';
import { axeRuntimeExceptionMsgPrefix, axeVersion } from '@sa11y/common';

const sync = require('@wdio/sync').default;

const numA11yIssues = 6;

/**
 * Test util function to get violations from given html file
 */
async function getViolationsHtml(htmlFilePath: string): Promise<axe.Result[]> {
    await browser.url(htmlFilePath);
    return runAxe({ driver: browser });
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

async function checkAccessible(expectNumA11yIssues = 0, options: Partial<Options> = {}): Promise<void> {
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
        await assertAccessible(options);
    } catch (e) {
        err = e;
    }
    checkA11yError(err, expectNumA11yIssues);
}

function checkAccessibleSync(expectNumA11yIssues = 0): void {
    let err: Error = new Error();
    // Note: WDIO doesn't provide snapshot feature to verify error thrown.
    //  Hence the longer try .. catch alternative
    try {
        assertAccessibleSync({ driver: browser });
    } catch (e) {
        err = e;
    }
    checkA11yError(err, expectNumA11yIssues);
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
    // TODO (test): add tests overriding the default rules
    // Note: "expect"s are in the helper method "checkAccessible"
    /* eslint-disable jest/expect-expect */
    it('should throw no error for html with no a11y issues', async () => {
        await browser.url(htmlFileWithNoA11yIssues);
        await checkAccessible(0);
    });

    it('should throw no error for element with no a11y issues', async () => {
        await browser.url(htmlFileWithNoA11yIssues);
        await checkAccessible(0, { context: browser.$(`#${shadowDomID}`) });
    });

    it('should throw error for html with a11y issues', async () => {
        await browser.url(htmlFileWithA11yIssues);
        await checkAccessible(numA11yIssues);
    });

    it('should throw error for element with a11y issues', async () => {
        await browser.url(htmlFileWithA11yIssues);
        await checkAccessible(1, { context: browser.$(`#${domWithA11yIssuesBodyID}`) });
    });
    /* eslint-enable jest/expect-expect */

    it('should throw error for non-existent element (sync mode)', async () => {
        await browser.url(htmlFileWithA11yIssues);
        let err: Error = new Error();
        try {
            // TODO (test): Is there a way to suppress the error stacktrace console log ?
            // Note: expect(..).to.Throw() does not work with wdio async
            console.log('Error expected. Please ignore =>');
            // using an existing elem ID using selector without the '#' prefix
            await assertAccessible({ context: browser.$(domWithA11yIssuesBodyID) });
        } catch (e) {
            err = e;
        }
        expect(err.message).toContain('Error: No elements found for include in page Context');
    });

    it('should throw no error for html with no a11y issues (sync mode)', () => {
        return sync(() => {
            browser.url(htmlFileWithNoA11yIssues);
            expect(() => assertAccessibleSync()).not.toThrow();
            checkAccessibleSync(0);
        });
    });

    it('should throw error for html with a11y issues (sync mode)', () => {
        return sync(() => {
            browser.url(htmlFileWithA11yIssues);
            expect(() => assertAccessibleSync()).toThrow();
            checkAccessibleSync(numA11yIssues);
        });
    });
});
