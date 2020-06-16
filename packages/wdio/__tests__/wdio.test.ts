/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as axe from 'axe-core';
import { extended } from '@sa11y/preset-rules';
import { assertAccessible } from '../src/wdio';
import { axeRuntimeExceptionMsgPrefix } from '@sa11y/common';

// TODO (deduplicate): with test-utils -> test-data
const noA11yIssuesHtml = `file:///${__dirname}/__data__/noA11yIssues.html`;
const a11yIssuesHtml = `file:///${__dirname}/__data__/a11yIssues.html`;
const numA11yIssues = 6;
// TODO (refactor): Find a way to declare version into axe namespace
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
// eslint-disable-next-line import/namespace
const axeVersion = axe.version;

async function getViolations(htmlFilePath: string): Promise<axe.Result[]> {
    await browser.url(htmlFilePath);

    // inject the script
    await browser.execute(axe.source);

    // run inside browser and get results
    const options = extended;
    // run inside browser and get results
    const results = await browser.executeAsync((options, done) => {
        axe.run(document, options, function (err: Error, results: axe.AxeResults) {
            if (err) throw err;
            done(results);
        });
    }, options);

    return results.violations;
}

describe('integration test axe with WebdriverIO', () => {
    it('should load test page', () => {
        browser.url(noA11yIssuesHtml);
        expect(browser).toHaveTitle('Test Page');
    });

    it('should inject axe', () => {
        browser.url(noA11yIssuesHtml);

        // inject axe
        expect(axe.source.length).toBeGreaterThan(0);
        browser.execute(axe.source);

        // run inside browser and get version
        const version = browser.executeAsync((done) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore
            // eslint-disable-next-line import/namespace
            done(axe.version);
        });

        // verify the version of axe injected into DOM
        expect(version).toBe(axeVersion);
    });

    it('should get violations', async () => {
        expect(await getViolations(noA11yIssuesHtml)).toHaveLength(0);
        expect(await getViolations(a11yIssuesHtml)).toHaveLength(numA11yIssues);
    });
});

describe('integration test @sa11y/wdio with WebdriverIO', function () {
    it('should throw no error for html with no a11y issues', async () => {
        expect.assertions(1);
        await browser.url(noA11yIssuesHtml);
        await assertAccessible().catch((e) => expect(e).toBeUndefined());
    });

    it('should throw error for html with a11y issues', async () => {
        expect.assertions(1);
        await browser.url(a11yIssuesHtml);
        await assertAccessible().catch((e) => {
            // TODO (test): Add this test to @sa11y/test-integration package
            // TODO (refactor): Explore if snapshot feature is available as a package (for mocha) without jest
            expect(e).toBeDefined();
            expect(e.toString()).not.toContain(axeRuntimeExceptionMsgPrefix);
            expect(e.toString()).toContain(`${numA11yIssues} accessibility issues found`);
        });
    });
});
