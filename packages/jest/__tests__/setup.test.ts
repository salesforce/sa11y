/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { registerA11yMatchers } from '../src';

describe('after registering the a11y matcher', () => {
    registerA11yMatchers();
    it.each(['toBeAccessible', 'toBeAccessibleWith'])('%s should be defined on expect object', (matcherName) => {
        expect(expect[matcherName]).toBeDefined();
    });
});
