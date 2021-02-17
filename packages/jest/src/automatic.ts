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
    // TODO (feat): add support for result consolidation across all tests for a test run
    //  and optional exclusion of selected tests
    // consolidateResults?: boolean;
    // excludeTests?: string[];
};

/**
 * Default options when {@link registerSa11yAutomaticChecks} is invoked
 */
const defaultAutoCheckOpts: AutoCheckOpts = {
    runAfterEach: true,
    cleanupAfterEach: true,
};

/**
 * Run accessibility check on each element node in the body using {@link toBeAccessible}
 * @param cleanup - boolean indicating if the DOM should be cleaned up after
 */
export async function automaticCheck(cleanup = false): Promise<void> {
    // Create a DOM walker filtering only elements (skipping text, comment nodes etc)
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);

    try {
        while (walker.nextNode()) await expect(walker.currentNode).toBeAccessible();
    } finally {
        // TODO (refactor): Store and process a11y issues for all elements
        //  in the body instead of just the first element that has a11y issues
        if (cleanup) document.body.innerHTML = '';
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
