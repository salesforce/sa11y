/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { registerSa11yMatcher, Sa11yOpts } from './setup';

/**
 *
 */
export type AutoCheckOpts = {
    runAfterEach: boolean;
    cleanupAfterEach: boolean;
    excludeTests: string[];
};

export const defaultAutoCheckOpts: AutoCheckOpts = {
    runAfterEach: false,
    cleanupAfterEach: false,
    excludeTests: [],
};

// TODO (refactor): expose sensible opts for users
export function registerSa11yAutomaticChecks(): void {
    const opts: Sa11yOpts = {
        autoCheckOpts: {
            runAfterEach: true,
            cleanupAfterEach: true,
            excludeTests: [],
        },
    };
    registerSa11yMatcher(opts);
}
