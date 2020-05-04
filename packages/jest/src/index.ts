/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

export { toBeAccessible } from './matcher';
export { adaptA11yConfig, registerA11yMatchers } from './setup';

export const jestConfig = {
    setupFilesAfterEnv: [require.resolve('./setup')],
};
