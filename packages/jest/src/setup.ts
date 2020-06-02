/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { toBeAccessible } from './matcher';
import { A11yConfig } from '@sa11y/preset-rules';

/**
 * Register accessibility helpers toBeAccessible as jest matchers
 */
export function registerSa11yMatcher(): void {
    // Ref: https://github.com/jest-community/jest-extended
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore error TS2339: Property 'expect' does not exist on type 'Global'.
    const jestExpect = global.expect;
    if (jestExpect !== undefined) {
        jestExpect.extend({ toBeAccessible });
    } else {
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
export function adaptA11yConfig(config: A11yConfig): A11yConfig {
    // TODO: Is it worth checking if we are running in jsdom before modifying config ?
    //  Ref: https://github.com/jsdom/jsdom/issues/1537#issuecomment-229405327
    // const runningInJSDOM = navigator.userAgent.includes('Node.js') || navigator.userAgent.includes('jsdom');
    // if (!runningInJSDOM) return config;
    return {
        ...config,
        rules: {
            // Disable color-contrast as it is doesn't work for JSDOM and might affect performance
            //  https://github.com/dequelabs/axe-core/issues/595
            //  https://github.com/dequelabs/axe-core/blob/develop/doc/examples/jsdom/test/a11y.js
            'color-contrast': { enabled: false },
        },
    };
}
