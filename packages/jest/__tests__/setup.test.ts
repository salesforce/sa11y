/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { registerSa11yMatcher } from '../src/setup';
import { expect, jest } from '@jest/globals';

describe('jest setup', () => {
    registerSa11yMatcher();
    it('should define matcher on expect object', () => {
        expect(expect['toBeAccessible']).toBeDefined();
    });

    /* Skipped: Difficult to mock the global "expect" when we are `import {expect} from '@jest/globals'` */
    it.skip('should throw error when global expect is undefined', () => {
        const globalExpect = expect as jest.Expect;
        expect(globalExpect).toBeDefined();
        expect(registerSa11yMatcher).not.toThrow();
        try {
            global.expect = undefined;
            globalExpect(registerSa11yMatcher).toThrowErrorMatchingSnapshot();
        } finally {
            global.expect = globalExpect;
        }
    });
});
