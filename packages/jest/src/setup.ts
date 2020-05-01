/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { toBeAccessible, toBeAccessibleWith } from './matcher';
import { A11yConfig } from '@sa11y/preset-rules';

/**
 * Register accessibility helpers toBeAccessible as jest matchers
 */
export function registerA11yMatchers(): void {
    // Ref: https://github.com/jest-community/jest-extended
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore error TS2339: Property 'expect' does not exist on type 'Global'.
    const jestExpect = global.expect;
    if (jestExpect !== undefined) {
        jestExpect.extend({ toBeAccessible });
        jestExpect.extend({ toBeAccessibleWith });
    } else {
        // Don't expect to run into this situation under normal circumstance. Not sure how to test for it easily either.
        /* istanbul ignore next */
        throw new Error(
            "Unable to find Jest's global expect." +
                '\nPlease check you have added @sa11y/jest correctly to your jest configuration.' +
                '\nSee https://github.com/salesforce/sa11y/blob/master/packages/jest/README.md for help.'
        );
    }
}

/**
 * Customize sa11y preset rules specific to JSDOM
 */
export function fixA11yConfig(config: A11yConfig): A11yConfig {
    return {
        ...config,
        rules: {
            'color-contrast': { enabled: false }, // Disable color-contrast
        },
    };
}
