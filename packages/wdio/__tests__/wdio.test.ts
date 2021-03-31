/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as axe from 'axe-core';
import {
    assertAccessible,
    assertAccessibleSync,
    AssertFunction,
    getAxeVersion,
    loadAxe,
    Options,
    runAxe,
} from '../src/wdio';
import {
    a11yIssuesCount,
    a11yIssuesCountFiltered,
    domWithA11yIssuesBodyID,
    exceptionList,
    htmlFileWithA11yIssues,
    htmlFileWithNoA11yIssues,
    shadowDomID,
} from '@sa11y/test-utils';
import { A11yError } from '@sa11y/format';
import { AxeResults, axeRuntimeExceptionMsgPrefix, axeVersion } from '@sa11y/common';

// TODO (chore): Raise issue with WebdriverIO - 'sync' missing 'default' in ts def
// TODO (debug): "import sync = require('@wdio/sync');" or
//  "import sync from '@wdio/sync';" doesn't work. Results in tests being skipped.
//  Could be related to https://github.com/TypeStrong/ts-node/issues/1007
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-var-requires
const sync = require('@wdio/sync').default;

/**
 * Test util function to get violations from given html file
 */
async function getViolationsHtml(htmlFilePath: string): Promise<AxeResults> {
    await browser.url(htmlFilePath);
    return runAxe();
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

async function checkAccessible(
    assertFunc: AssertFunction,
    expectNumA11yIssues = 0,
    options: Partial<Options> = {}
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
        expect(await getViolationsHtml(htmlFileWithA11yIssues)).toHaveLength(a11yIssuesCount);
    });
});

describe('integration test @sa11y/wdio with WebdriverIO', () => {
    // Note: "expect"s are in the helper method "checkAccessible"
    /* eslint-disable jest/expect-expect */
    it('should not throw error for html with no a11y issues', async () => {
        await browser.url(htmlFileWithNoA11yIssues);
        await checkAccessible(assertAccessible);
    });

    it('should not throw error for element with no a11y issues', async () => {
        await browser.url(htmlFileWithNoA11yIssues);
        await checkAccessible(assertAccessible, 0, { scope: browser.$(`#${shadowDomID}`) });
    });

    it('should throw error for html with a11y issues', async () => {
        await browser.url(htmlFileWithA11yIssues);
        await checkAccessible(assertAccessible, a11yIssuesCount);
    });

    it('should throw error for element with a11y issues', async () => {
        await browser.url(htmlFileWithA11yIssues);
        await checkAccessible(assertAccessible, 1, { scope: browser.$(`#${domWithA11yIssuesBodyID}`) });
    });
    /* eslint-enable jest/expect-expect */

    /* eslint-disable @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call */
    it('should not throw error for html with no a11y issues in sync mode', () => {
        return sync(() => {
            void browser.url(htmlFileWithNoA11yIssues);
            expect(() => assertAccessibleSync()).not.toThrow();
            void checkAccessible(assertAccessibleSync);
        });
    });

    it('should throw error for html with a11y issues in sync mode', () => {
        return sync(() => {
            void browser.url(htmlFileWithA11yIssues);
            expect(() => assertAccessibleSync()).toThrow();
            void checkAccessible(assertAccessibleSync, a11yIssuesCount);
        });
    });

    it('should throw error for non-existent element', async () => {
        await browser.url(htmlFileWithA11yIssues);
        let err: Error = new Error();
        try {
            // TODO (test): Is there a way to suppress the error stacktrace console log ?
            // Note: expect(..).to.Throw() does not work with wdio async
            console.log('****** Error expected. Ignore ========>');
            // using an existing elem ID using selector without the '#' prefix
            await assertAccessible({ scope: browser.$(domWithA11yIssuesBodyID) });
        } catch (e) {
            err = e as Error;
            console.log('<========= Ignore. Error expected ****** ');
        }
        expect(err.message).toContain('Error: No elements found for include in page Context');
    });

    it('should filter violations with exception list', () => {
        const opts = { exceptionList: exceptionList };
        return sync(() => {
            void browser.url(htmlFileWithA11yIssues);
            expect(() => assertAccessibleSync(opts)).toThrow();
            void checkAccessible(assertAccessibleSync, a11yIssuesCountFiltered, opts);
        });
    });
    /* eslint-enable @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call */
});
