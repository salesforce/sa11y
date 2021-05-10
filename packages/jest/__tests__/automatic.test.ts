/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { setup } from '../src';
import * as automatic from '../src/automatic';
import { automaticCheck, registerSa11yAutomaticChecks } from '../src/automatic';
import {
    beforeEachSetup,
    checkA11yErrorFunc,
    domWithA11yIssues,
    domWithNoA11yIssues,
    domWithNoA11yIssuesChildCount,
} from '@sa11y/test-utils';
import { ConsolidatedResults } from '@sa11y/format';

describe('automatic checks registration', () => {
    const PREV_ENV = process.env;
    afterAll(() => {
        jest.restoreAllMocks();
        process.env = PREV_ENV; // Restore prev env
    });

    beforeEach(() => {
        // Reset process.env Ref: https://stackoverflow.com/a/48042799
        jest.resetModules();
        process.env = { ...PREV_ENV }; // Copy prev env
        ConsolidatedResults.clear();
    });

    const registerAutomaticMock = jest.spyOn(automatic, 'registerSa11yAutomaticChecks');

    it('should run when called directly without setup', () => {
        registerSa11yAutomaticChecks(); // exercising default args for code cov
        expect(registerAutomaticMock).toHaveBeenCalledWith();
    });

    it('should not run by default via setup', () => {
        setup();
        expect(registerAutomaticMock).toHaveBeenCalledWith({
            runAfterEach: false,
            cleanupAfterEach: false,
            consolidateResults: false,
        });
    });

    it('should run when opted in via setup', () => {
        setup({ autoCheckOpts: { runAfterEach: true } });
        expect(registerAutomaticMock).toHaveBeenCalledWith({
            runAfterEach: true,
            cleanupAfterEach: false,
            consolidateResults: true,
        });
    });

    it('should not run when opted out with env vars', () => {
        // TODO (debug): If this test is moved to after the next test it fails
        //  even with process.env cleanup after/before each test or jest.isolateModules()
        //  Use mocked-env pkg ?
        process.env.SA11Y_AUTO = '';
        process.env.SA11Y_CLEANUP = '';
        setup();
        expect(registerAutomaticMock).toHaveBeenCalledWith({
            runAfterEach: false,
            cleanupAfterEach: false,
            consolidateResults: false,
        });
    });

    it('should run when opted in with env vars', () => {
        process.env.SA11Y_AUTO = '1';
        setup();
        expect(registerAutomaticMock).toHaveBeenCalledWith({
            runAfterEach: true,
            cleanupAfterEach: false,
            consolidateResults: true,
        });

        process.env.SA11Y_CLEANUP = '1';
        setup();
        expect(registerAutomaticMock).toHaveBeenCalledWith({
            runAfterEach: true,
            cleanupAfterEach: true,
            consolidateResults: true,
        });
    });
});

describe('automatic checks call', () => {
    // Note: cleanup required at end of test to prevent dom being checked again after
    // the test as part of the afterEach automatic check hook
    beforeEach(beforeEachSetup);

    it('should not raise a11y issues for DOM without a11y issues', async () => {
        document.body.innerHTML = domWithNoA11yIssues;
        await expect(automaticCheck()).resolves.not.toThrow();
    });

    // eslint-disable-next-line jest/expect-expect
    it('should raise a11y issues for DOM with a11y issues', async () => {
        document.body.innerHTML = domWithA11yIssues;
        await checkA11yErrorFunc(() => automaticCheck({ cleanupAfterEach: true }));
    });

    it.each([0, 1, 2, 3])(
        'should raise consolidated a11y issues for DOM with multiple a11y issues',
        async (numNodesWithIssues) => {
            document.body.innerHTML = domWithA11yIssues;

            // Note: Create multiple children in body with a11y issues
            for (let i = 0; i < numNodesWithIssues; i++) {
                document.body.innerHTML += `<a id="link-${i}" href="#"></a>`;
            }
            await checkA11yErrorFunc(() => automaticCheck({ cleanupAfterEach: true }));
        }
    );

    it('should cleanup DOM by default', async () => {
        document.body.innerHTML = domWithNoA11yIssues;
        expect(document.body.childElementCount).toBe(domWithNoA11yIssuesChildCount);
        await automaticCheck();
        expect(document.body.childElementCount).toBe(0);
    });

    it('should not cleanup DOM when opted out', async () => {
        document.body.innerHTML = domWithNoA11yIssues;
        expect(document.body.childElementCount).toBe(domWithNoA11yIssuesChildCount);
        await automaticCheck({ cleanupAfterEach: false });
        expect(document.body.childElementCount).toBe(domWithNoA11yIssuesChildCount);
    });

    // eslint-disable-next-line jest/expect-expect
    it('should not raise error for duplicated issues', async () => {
        // TODO (Refactor): extract out duplicated code to set dom, expect assertions and invoke automatic check
        document.body.innerHTML = domWithA11yIssues;
        // const opts = { cleanupAfterEach: false };
        await checkA11yErrorFunc(() => automaticCheck({ cleanupAfterEach: true }));
        // TODO (DEBUG): Following results in "Error running accessibility checks using axe: undefined"
        // Should not throw error for the same DOM with consolidation
        // document.body.innerHTML = domWithA11yIssues;
        // await checkA11yErrorFunc(() => automaticCheck({ cleanupAfterEach: true }));
        // expect(async () => await automaticCheck()).not.toThrow();
        // Should throw error again without consolidation
        // Note: cleanup required to prevent domWithA11yIssues being checked again after
        // the test as part of the afterEach hook that was setup in the previous
        // describe block
        // await automaticCheck({ cleanupAfterEach: true, consolidateResults: false }).catch((e) => checkA11yError(e));
    });
});
