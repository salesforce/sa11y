/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { toBeAccessible } from './matcher';
import { A11yConfig } from '@sa11y/preset-rules';
import { AutoCheckOpts, defaultAutoCheckOpts } from './automatic';

/**
 * Options to be passed on to {@link registerSa11yMatcher}
 */
export type Sa11yOpts = {
    autoCheckOpts: AutoCheckOpts;
    // TODO (feat): add support for global opts to control formatting, filtering etc
    // formatOpts: FormatOpts; // including format.Options
    // filterOpts: FilterOpts; // including exception list filtering
};

const defaultSa11yOpts: Sa11yOpts = {
    autoCheckOpts: defaultAutoCheckOpts,
};

/**
 * Register accessibility helpers toBeAccessible as jest matchers
 */
export function registerSa11yMatcher(opts: Sa11yOpts = defaultSa11yOpts): void {
    if (expect !== undefined) {
        expect.extend({ toBeAccessible });
    } else {
        throw new Error(
            "Unable to find Jest's expect function." +
                '\nPlease check your Jest installation and that you have added @sa11y/jest correctly to your jest configuration.' +
                '\nSee https://github.com/salesforce/sa11y/tree/master/packages/jest#readme for help.'
        );
    }

    if (opts.autoCheckOpts.runAfterEach) {
        afterEach(async () => {
            // TODO (spike): Is there a better way to walk the DOM ?
            //  https://developer.mozilla.org/en-US/docs/Web/API/Node/firstChild
            // TODO (debug): Without cleanup won't this result in an infinite loop ?
            while (document.body.firstChild) {
                try {
                    await expect(document.body.firstChild).toBeAccessible();
                } finally {
                    if (opts.autoCheckOpts.cleanupAfterEach) {
                        document.body.removeChild(document.body.firstChild);
                    }
                }
            }
        });
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
