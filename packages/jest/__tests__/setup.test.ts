/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { adaptA11yConfig, registerSa11yMatcher } from '../src/setup';
import { base, extended } from '@sa11y/preset-rules';

describe('jest setup', () => {
    registerSa11yMatcher();
    it('should define matcher on expect object', () => {
        expect(expect['toBeAccessible']).toBeDefined();
    });

    it.each([extended, base])('should customize %s preset-rule as expected', (config) => {
        expect(config.rules).toBeUndefined();
        expect(adaptA11yConfig(config).rules['color-contrast'].enabled).toBe(false);
    });

    it('should throw error when global expect is undefined', () => {
        const globalExpect = global.expect as jest.Expect;
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
