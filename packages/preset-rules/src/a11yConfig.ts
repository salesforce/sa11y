/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { RunOptions } from 'axe-core';

/**
 * A11yConfig defines options to run accessibility checks using axe specifying list of rules to test
 */
export interface A11yConfig extends RunOptions {
    runOnly: {
        type: 'rule';
        values: string[];
    };
    resultTypes: ['violations'];
}

/**
 * Returns config to be used in axe.run() with given rules
 *
 * @param rules - List of rules to be used in the config
 * @returns A11yConfig with formatted rules
 */
export function getA11yConfig(rules: string[]): A11yConfig {
    // Note: Making the returned config immutable using Object.freeze() results in
    //  "TypeError: Cannot add property reporter, object is not extensible"
    //  even when no local modifications are made. axe.run() itself seems to be modifying the config object.
    return {
        runOnly: {
            type: 'rule',
            values: rules,
        },
        // Disable preloading assets as it causes timeouts for audio/video
        preload: false,
        resultTypes: ['violations'],
    };
}
