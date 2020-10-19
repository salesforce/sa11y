/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { BrowserObject, remote } from 'webdriverio';
import { assertAccessibleSync } from '@sa11y/wdio';
import { htmlFileWithA11yIssues, htmlFileWithNoA11yIssues } from '@sa11y/test-utils';

// TODO (chore): Raise issue with WebdriverIO - 'sync' missing 'default' in ts def
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-var-requires
const sync = require('@wdio/sync').default;

const defaultJestTimeout = 5000; // Is there a way to get this dynamically ?

let browser: BrowserObject;

beforeAll(async () => {
    jest.setTimeout(defaultJestTimeout * 100); // Increase timeout for WebdriverIO tests

    // Ref: https://www.npmjs.com/package/@wdio/sync#using-webdriverio-as-standalone-package
    // TODO (refactor): Is there a way to reuse the config object from wdio.conf.js here ?
    browser = await remote({
        runner: 'local',
        capabilities: {
            browserName: 'chrome',
            /* cSpell:disable */
            'goog:chromeOptions': {
                // https://developers.google.com/web/updates/2017/04/headless-chrome)
                args: ['--headless', '--disable-gpu'],
            },
            /* cSpell:enable */
        },
        logLevel: 'warn',
    });
});

afterAll(async () => {
    await browser.deleteSession();
    jest.setTimeout(defaultJestTimeout);
});

describe('integration test @sa11y/wdio in sync mode', () => {
    it('should throw error for html with a11y issues', () => {
        expect(browser).toBeTruthy();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
        return sync(() => {
            void browser.url(htmlFileWithA11yIssues);
            expect(() => assertAccessibleSync(browser)).toThrowErrorMatchingSnapshot();
        });
    });

    it('should not throw error for html with no a11y issues', () => {
        expect(browser).toBeTruthy();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
        return sync(() => {
            void browser.url(htmlFileWithNoA11yIssues);
            expect(() => assertAccessibleSync(browser)).not.toThrow();
        });
    });
});
