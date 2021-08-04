/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { A11yConfig } from '@sa11y/common';

/**
 * Returns config to be used in axe.run() with given rules
 * Ref: https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#options-parameter
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
        // Disable preloading assets as it causes timeouts for audio/video elements
        //  with jest and delays webdriver tests by 2-3x when assets are not found (404)
        //  Ref: https://github.com/dequelabs/axe-core/issues/2528
        preload: false,
        // Types not listed will still show a maximum of one node
        resultTypes: ['violations'],
        reporter: 'no-passes', // return only violation results
    };
}
