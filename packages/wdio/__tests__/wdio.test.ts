/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as axe from 'axe-core';
import { extended } from '@sa11y/preset-rules';

// TODO (deduplicate): with test-utils -> test-data
const noA11yIssuesHtml = `file:///${__dirname}/__data__/noA11yIssues.html`;
const a11yIssuesHtml = `file:///${__dirname}/__data__/a11yIssues.html`;
// TODO (refactor): Find a way to declare version into axe namespace
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
// eslint-disable-next-line import/namespace
const axeVersion = axe.version;

function getViolations(htmlFilePath: string): axe.Result[] {
    browser.url(htmlFilePath);

    // inject the script
    browser.execute(axe.source);

    // run inside browser and get results
    const options = extended;
    // run inside browser and get results
    const results = browser.executeAsync((options, done) => {
        /* eslint-disable no-undef */
        axe.run(document, options, function (err: Error, results: axe.AxeResults) {
            if (err) throw err;
            done(results);
        });
    }, options);
    /* eslint-enable no-undef */

    return results.violations;
}

describe('integration test axe with WebdriverIO', () => {
    it('loads test page', () => {
        browser.url(noA11yIssuesHtml);
        expect(browser).toHaveTitle('Test Page');
    });

    it('injects axe', () => {
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

    it('gets violations', () => {
        expect(getViolations(noA11yIssuesHtml)).toHaveLength(0);
        expect(getViolations(a11yIssuesHtml)).toHaveLength(6);
    });
});
