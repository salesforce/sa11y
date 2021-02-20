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
    checkA11yError,
    domWithA11yIssues,
    domWithNoA11yIssues,
    domWithNoA11yIssuesChildCount,
} from '@sa11y/test-utils';

describe('automatic checks registration', () => {
    afterAll(() => {
        jest.restoreAllMocks();
        process.env.SA11Y_AUTO = '';
        process.env.SA11Y_CLEANUP = '';
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
        });
    });

    it('should run when opted in via setup', () => {
        setup({ autoCheckOpts: { runAfterEach: true } });
        expect(registerAutomaticMock).toHaveBeenCalledWith({
            runAfterEach: true,
            cleanupAfterEach: false,
        });
    });

    it('should run when opted in with env vars', () => {
        process.env.SA11Y_AUTO = '1';
        setup();
        expect(registerAutomaticMock).toHaveBeenCalledWith({
            runAfterEach: true,
            cleanupAfterEach: false,
        });

        process.env.SA11Y_CLEANUP = '1';
        setup();
        expect(registerAutomaticMock).toHaveBeenCalledWith({
            runAfterEach: true,
            cleanupAfterEach: true,
        });
    });
});

describe('automatic checks call', () => {
    beforeEach(beforeEachSetup);
    // Note: "expect"s are in the helper method "checkA11yError"
    /* eslint-disable jest/expect-expect */

    it('should not raise a11y issues for DOM without a11y issues', async () => {
        document.body.innerHTML = domWithNoA11yIssues;
        await automaticCheck(); // throws no error
    });

    it('should raise a11y issues for DOM with a11y issues', async () => {
        document.body.innerHTML = domWithA11yIssues;
        // Note: cleanup required to prevent domWithA11yIssues being checked again after
        // the test as part of the afterEach hook that was setup in the previous
        // describe block
        await automaticCheck(true).catch((e) => checkA11yError(e));
    });

    it('should raise consolidated a11y issues for DOM with multiple a11y issues', async () => {
        // Note: Create multiple children in body with a11y issues
        document.body.innerHTML =
            domWithA11yIssues +
            `<a id="second-link" href="#"></a>` +
            `<a id="third-link" href="#"></a>` +
            `<a id="fourth-link" href="#"></a>`;
        // Note: cleanup required to prevent domWithA11yIssues being checked again after
        // the test as part of the afterEach hook that was setup in the previous
        // describe block
        await automaticCheck(true).catch((e) => checkA11yError(e));
    });
    /* eslint-enable jest/expect-expect */

    it('should not cleanup DOM by default', async () => {
        document.body.innerHTML = domWithNoA11yIssues;
        expect(document.body.childElementCount).toBe(domWithNoA11yIssuesChildCount);
        await automaticCheck();
        expect(document.body.childElementCount).toBe(domWithNoA11yIssuesChildCount);
    });

    it('should cleanup DOM when opted in', async () => {
        document.body.innerHTML = domWithNoA11yIssues;
        expect(document.body.childElementCount).toBe(domWithNoA11yIssuesChildCount);
        await automaticCheck(true);
        expect(document.body.childElementCount).toBe(0);
    });
});
