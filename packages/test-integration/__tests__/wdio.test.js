/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

const axeSource = require('axe-core').source;

// TODO (deduplicate): with test-utils.domWithNoA11yIssues
const testPage = `file:///${__dirname}/__data__/noA11yIssues.html`;

describe('integration test with WebdriverIO', () => {
    it('loads test page', () => {
        browser.url(testPage);
        expect(browser).toHaveTitle('Test Page');
    });

    it('injects axe', () => {
        browser.url(testPage);

        // inject the script
        expect(axeSource.length).toBeGreaterThan(0);
        browser.execute(axeSource);

        // run inside browser and get results
        const options = { runOnly: { type: 'tag', values: ['wcag2a'] } };
        // run inside browser and get results
        const results = browser.executeAsync((options, done) => {
            /* eslint-disable no-undef */
            axe.run(document, options, function (err, results) {
                if (err) throw err;
                done(results);
            });
        }, options);
        /* eslint-enable no-undef */

        // assert there are no violations
        expect(results.violations).toHaveLength(0);
    });
});
