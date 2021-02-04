/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { registerSa11yAutomaticChecks } from '../src/automatic';
import { beforeEachSetup, domWithA11yIssues } from '@sa11y/test-utils';

describe('automatic checks', () => {
    beforeEach(() => {
        beforeEachSetup();
        document.body.innerHTML = domWithA11yIssues;
    });

    try {
        it('should not run automatic checks by default', () => {
            // registerSa11yMatcher();
            registerSa11yAutomaticChecks();
        });
    } catch (e) {
        if (e !== undefined) {
            throw new Error(`Received unexpected error when not running automatic checks ' ${(e as Error).message}`);
        }
    }

    it('should run automatic checks when opted in', () => {
        registerSa11yAutomaticChecks();
    });
});
