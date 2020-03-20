/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { RunOptions } from 'axe-core';

/**
 * AxeConfig is limited to subset of options that we need and use in this library
 * */
export interface AxeConfig extends RunOptions {
    runOnly: {
        type: 'rule';
        values: string[];
    };
    resultTypes: ['violations'];
}

/**
 * Returns config to be used in axe.run() with given rules
 * @param rules - List of rules to be used in the config
 */
export function getAxeConfig(rules: string[]): AxeConfig {
    return {
        runOnly: {
            type: 'rule',
            values: rules,
        },
        resultTypes: ['violations'],
    };
}
