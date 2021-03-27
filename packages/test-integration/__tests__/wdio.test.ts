/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { assertAccessibleSync } from '@sa11y/wdio';
import {
    htmlFileWithA11yIssues,
    htmlFileWithNoA11yIssues,
    htmlFileWithVisualA11yIssues,
    setupWDIO,
    teardownWDIO,
} from '@sa11y/test-utils';

// TODO (chore): Raise issue with WebdriverIO - 'sync' missing 'default' in ts def
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-var-requires
const sync: CallableFunction = require('@wdio/sync').default;

beforeAll(setupWDIO);
afterAll(teardownWDIO);

// TODO: FIX "Error running accessibility checks using axe: Cannot read property 'element-6066-11e4-a52e-4f735466cecf' of undefined"
//  Started happening after recent WDIO element scope refactor.
//  Switching to sync mode or browser commands doesn't help.

// TODO(refactor): Switch to using sa11y API via browser commands for this test module
//  once above error is fixed.
describe.skip('integration test @sa11y/wdio in sync mode', () => {
    it('should have browser object be setup', () => {
        expect(browser).toBeTruthy();
    });

    it('should throw error for html with a11y issues', () => {
        expect(browser).toBeTruthy();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return sync(() => {
            void browser.url(htmlFileWithA11yIssues);
            expect(() => assertAccessibleSync({ driver: browser })).toThrowErrorMatchingSnapshot();
        });
    });

    it('should not throw error for html with no a11y issues', () => {
        expect(browser).toBeTruthy();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return sync(() => {
            void browser.url(htmlFileWithNoA11yIssues);
            expect(() => assertAccessibleSync({ driver: browser })).not.toThrow();
        });
    });

    it('should throw error for html with visual a11y issues', () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
        return sync(() => {
            void browser.url(htmlFileWithVisualA11yIssues);
            expect(() => assertAccessibleSync({ driver: browser })).toThrowErrorMatchingSnapshot();
        });
    });
});
