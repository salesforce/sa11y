/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { adaptA11yConfig, registerSa11yMatcher } from '../src/setup';
import { extended, recommended } from '@sa11y/preset-rules';

describe('jest setup', () => {
    registerSa11yMatcher();
    it('should define matcher on expect object', () => {
        expect(expect['toBeAccessible']).toBeDefined();
    });

    it.each([extended, recommended])('should customize %s preset-rule as expected', (config) => {
        expect(config.rules).toBeUndefined();
        expect(adaptA11yConfig(config).rules['color-contrast'].enabled).toBe(false);
    });

    it('should throw error when global expect is undefined', () => {
        /* eslint-disable @typescript-eslint/ban-ts-ignore */
        // @ts-ignore error TS2339: Property 'expect' does not exist on type 'Global'.
        const globalExpect = global.expect;
        expect(globalExpect).toBeDefined();
        expect(registerSa11yMatcher).not.toThrow();
        try {
            // @ts-ignore error TS2339: Property 'expect' does not exist on type 'Global'.
            global.expect = undefined;
            globalExpect(registerSa11yMatcher).toThrowErrorMatchingSnapshot();
        } finally {
            // @ts-ignore error TS2339: Property 'expect' does not exist on type 'Global'.
            global.expect = globalExpect;
        }
        /* eslint-enable @typescript-eslint/ban-ts-ignore */
    });
});
