/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { fixA11yConfig, registerA11yMatchers } from '../src';
import { extended, recommended } from '@sa11y/preset-rules';

describe('jest setup', () => {
    registerA11yMatchers();
    it.each(['toBeAccessible', 'toBeAccessibleWith'])('should defined %s matcher on expect object', (matcherName) => {
        expect(expect[matcherName]).toBeDefined();
    });

    fixA11yConfig();
    it.each([extended, recommended])('should customize preset-rules as expected', (config) => {
        expect(config.rules['color-contrast'].enabled).toBe(false);
    });
});
