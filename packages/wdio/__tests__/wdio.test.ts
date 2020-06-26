/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as axe from 'axe-core';
import { assertAccessible, axeVersion, getAxeVersion, loadAxe, runAxe } from '../src/wdio';
import { axeRuntimeExceptionMsgPrefix } from '@sa11y/common';

// TODO (deduplicate): with test-utils -> test-data
const noA11yIssuesHtml = `file:///${__dirname}/__data__/noA11yIssues.html`;
const a11yIssuesHtml = `file:///${__dirname}/__data__/a11yIssues.html`;
const numA11yIssues = 6;

/**
 * Test util function to get violations from given html file
 */
async function getViolationsHtml(htmlFilePath: string): Promise<axe.Result[]> {
    await browser.url(htmlFilePath);
    return runAxe(browser);
}

describe('integration test axe with WebdriverIO', () => {
    it('should load test page', async () => {
        await browser.url(noA11yIssuesHtml);
        expect(await browser.getTitle()).toBe('Test Page');
    });

    it('should inject axe', async () => {
        await browser.url(noA11yIssuesHtml);

        // Before loading axe, get version should not be defined
        expect(await getAxeVersion(browser)).toBeFalsy();
        expect(axe.source.length).toBeGreaterThan(0);
        await loadAxe(browser);

        // After loading axe, get version should work as expected
        expect(await getAxeVersion(browser)).toBe(axeVersion);
    });

    it('should get violations', async () => {
        expect(await getViolationsHtml(noA11yIssuesHtml)).toHaveLength(0);
        expect(await getViolationsHtml(a11yIssuesHtml)).toHaveLength(numA11yIssues);
    });
});

describe('integration test @sa11y/wdio with WebdriverIO', function () {
    it('should throw no error for html with no a11y issues', async () => {
        expect.assertions(1);
        await browser.url(noA11yIssuesHtml);
        await assertAccessible().catch((e) => expect(e).toBeUndefined());
    });

    it('should throw error for html with a11y issues', async () => {
        // TODO (debug): setting expected number of assertions doesn't seem to be working correctly in mocha
        // expect.assertions(100); // still passes ???
        await browser.url(a11yIssuesHtml);
        await assertAccessible().catch((e) => {
            // TODO (test): Add this test to @sa11y/test-integration package ?
            expect(e).toBeDefined();
            expect(e.toString()).not.toContain(axeRuntimeExceptionMsgPrefix);
            expect(e.toString()).toContain(`${numA11yIssues} accessibility issues found`);
        });
    });
});
