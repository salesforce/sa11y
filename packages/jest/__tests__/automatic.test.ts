/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { setup } from '../src';
import * as automatic from '../src/automatic';
import { automaticCheck } from '../src/automatic';
import { beforeEachSetup, checkA11yError, domWithA11yIssues, domWithNoA11yIssues } from '@sa11y/test-utils';

describe('automatic checks registration', () => {
    afterAll(jest.restoreAllMocks);
    const registerAutomaticMock = jest.spyOn(automatic, 'registerSa11yAutomaticChecks');

    it('should not run by default', () => {
        setup();
        expect(registerAutomaticMock).toHaveBeenLastCalledWith({
            runAfterEach: false,
            cleanupAfterEach: false,
        });
    });

    it('should run when opted in', () => {
        setup({ autoCheckOpts: { runAfterEach: true } });
        expect(registerAutomaticMock).toHaveBeenLastCalledWith({
            runAfterEach: true,
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
    /* eslint-enable jest/expect-expect */

    it('should not cleanup DOM by default', async () => {
        document.body.innerHTML = domWithNoA11yIssues;
        await automaticCheck();
        expect(document.body.innerHTML).not.toBe('');
        // TODO (refactor): replace with a regex check on DOM content
        // expect(domWithNoA11yIssues.replace(/\s/g, '')).toContain(document.body.innerHTML.replace(/\s/g, ''));
    });

    it('should cleanup DOM when opted in', async () => {
        document.body.innerHTML = domWithNoA11yIssues;
        await automaticCheck(true);
        expect(document.body.innerHTML).toBe('');
    });
});
