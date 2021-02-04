/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * Options for Automatic checks to be passed to {@link registerSa11yAutomaticChecks}
 */
export type AutoCheckOpts = {
    runAfterEach?: boolean;
    cleanupAfterEach?: boolean;
    excludeTests?: string[];
};

/**
 * Default options when {@link registerSa11yAutomaticChecks} is invoked
 */
const defaultAutoCheckOpts: AutoCheckOpts = {
    runAfterEach: true,
    cleanupAfterEach: true,
    excludeTests: [],
};

/**
 * Run accessibility check on each node in the DOM using {@link toBeAccessible}
 * @param cleanup - boolean indicating if the DOM should be cleaned up after
 */
export async function automaticCheck(cleanup = false): Promise<void> {
    while (document.body.firstChild) {
        try {
            // TODO (fix): check if sa11y matcher is registered and register
            await expect(document.body.firstChild).toBeAccessible();
        } finally {
            // TODO (spike): Is there a better way to walk the DOM that makes cleanup optional ?
            //  Current way of walking the DOM leads to infinite loop if not cleaned up.
            //  Could implement a list of visited nodes and check accordingly.
            //  But will cleanup being optional add any value to the user?
            //  https://developer.mozilla.org/en-US/docs/Web/API/Node/firstChild
            // if (cleanup)
            document.body.removeChild(document.body.firstChild);
        }
    }
}

/**
 * Register accessibility checks to be run automatically after each test
 * @param opts - Options for automatic checks {@link AutoCheckOpts}
 */
export function registerSa11yAutomaticChecks(opts: AutoCheckOpts = defaultAutoCheckOpts): void {
    if (opts.runAfterEach) {
        afterEach(async () => {
            await automaticCheck(opts.cleanupAfterEach);
        });
    }
}
