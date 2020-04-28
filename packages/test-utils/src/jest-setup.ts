/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { extended, recommended } from '@sa11y/preset-rules';

// TODO: Can these functions be moved into @sa11y/jest as utils or as setupFiles so that API users can also use them?

/**
 * Common Jest setup that sets up jsdom and customizes preset-rules for jsdom
 */
export function beforeAllSetup(): void {
    document.documentElement.lang = 'en'; // required for a11y lang check

    // Customize rules specific to jsdom
    [extended, recommended].forEach(
        (config) =>
            (config.rules = {
                'color-contrast': { enabled: false }, // Disable color-contrast for jsdom
            })
    );
}

/**
 * Common Jest cleanup after each test
 */
export function afterEachCleanup(): void {
    document.body.innerHTML = ''; // reset dom body
}
