/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
'use strict';

import { extended } from '../lib/extended';
import { recommended } from '../lib/recommended';

describe('@sa11y/rules', () => {
    it('recommended is a subset of extended', () => {
        expect(extended.runOnly.values).toEqual(expect.arrayContaining(recommended.runOnly.values));
        expect(extended).toEqual(expect.objectContaining(recommended));
    });
});
