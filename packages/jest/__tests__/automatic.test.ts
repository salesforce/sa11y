/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { registerSa11yAutomaticChecks, automaticCheck } from '../src/automatic';
import { beforeEachSetup, domWithA11yIssues } from '@sa11y/test-utils';
import { registerSa11yMatcher } from '../src';

describe('automatic checks registration', () => {
    // Note: Disable eslint for mock related import
    // eslint-disable-next-line @typescript-eslint/no-var-requires,@typescript-eslint/no-unsafe-assignment
    const automatic = require('../src/automatic');
    const registerAutomaticMock = jest.spyOn(automatic, 'registerSa11yAutomaticChecks');

    it('should not run by default', () => {
        registerSa11yMatcher();
        expect(registerAutomaticMock).toHaveBeenLastCalledWith({
            cleanupAfterEach: false,
            excludeTests: [],
            runAfterEach: false,
        });
    });

    it('should run when opted in', () => {
        registerSa11yMatcher({ autoCheckOpts: { runAfterEach: true } });
        expect(registerAutomaticMock).toHaveBeenLastCalledWith({ runAfterEach: true });
    });
});

describe('automatic checks call', () => {
    beforeAll(() => {
        registerSa11yAutomaticChecks();
    });

    beforeEach(beforeEachSetup);

    it('should raise a11y issues for DOM with a11y issues', async () => {
        document.body.innerHTML = domWithA11yIssues;
        await automaticCheck(true).catch((e) => expect(e).toMatchSnapshot());
    });
});
