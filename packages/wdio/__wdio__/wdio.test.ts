/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as axe from 'axe-core';
import { assertAccessible, assertAccessibleSync, getAxeVersion, loadAxe, runAxe } from '../src/wdio';
import {
    a11yIssuesCount,
    a11yIssuesCountFiltered,
    checkA11yErrorWdio,
    domWithA11yIssuesBodyID,
    exceptionList,
    htmlFileWithA11yIssues,
    htmlFileWithNoA11yIssues,
    shadowDomID,
} from '@sa11y/test-utils';
import { AxeResults, axeVersion } from '@sa11y/common';

/**
 * Test util function to get violations from given html file
 */
async function getViolationsHtml(htmlFilePath: string): Promise<AxeResults> {
    await browser.url(htmlFilePath);
    return runAxe();
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
    it('should not throw error for html with no a11y issues', async () => {
        await browser.url(htmlFileWithNoA11yIssues);
        await checkA11yErrorWdio(assertAccessible);
    });

    it('should not throw error for element with no a11y issues', async () => {
        await browser.url(htmlFileWithNoA11yIssues);
        await checkA11yErrorWdio(assertAccessible, 0, { scope: browser.$(`#${shadowDomID}`) });
    });

    it('should throw error for html with a11y issues', async () => {
        await browser.url(htmlFileWithA11yIssues);
        await checkA11yErrorWdio(assertAccessible, a11yIssuesCount);
    });

    it('should throw error for element with a11y issues', async () => {
        await browser.url(htmlFileWithA11yIssues);
        await checkA11yErrorWdio(assertAccessible, 1, { scope: browser.$(`#${domWithA11yIssuesBodyID}`) });
    });

    /* eslint-disable @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call */
    it('should not throw error for html with no a11y issues in sync mode', async () => {
        await browser.url(htmlFileWithNoA11yIssues);
        expect(() => assertAccessibleSync()).not.toThrow();
        await checkA11yErrorWdio(assertAccessibleSync);
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

    it('should filter violations with exception list', async () => {
        const opts = { exceptionList: exceptionList };

        await browser.url(htmlFileWithA11yIssues);
        expect(() => assertAccessibleSync(opts)).toThrow();
        await checkA11yErrorWdio(assertAccessibleSync, a11yIssuesCountFiltered, opts);
    });
    /* eslint-enable @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call */
});
