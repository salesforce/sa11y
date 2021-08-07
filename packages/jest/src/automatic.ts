/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { AxeResults, log } from '@sa11y/common';
import { getViolationsJSDOM } from '@sa11y/assert';
import { A11yError } from '@sa11y/format';
import { isTestUsingFakeTimer } from './matcher';

/**
 * Options for Automatic checks to be passed to {@link registerSa11yAutomaticChecks}
 */
export type AutoCheckOpts = {
    runAfterEach?: boolean;
    cleanupAfterEach?: boolean;
    consolidateResults?: boolean;
    // TODO (feat): add support for optional exclusion of selected tests
    // excludeTests?: string[];
    // List of file names to run automatic checks, if specified other files are ignored
    runOnlyOnFiles?: string[];
};

/**
 * Default options when {@link registerSa11yAutomaticChecks} is invoked
 */
const defaultAutoCheckOpts: AutoCheckOpts = {
    runAfterEach: true,
    cleanupAfterEach: true,
    consolidateResults: true,
    runOnlyOnFiles: [],
};

/**
 * Run accessibility check on each element node in the body using {@link toBeAccessible}
 * @param opts - Options for automatic checks {@link AutoCheckOpts}
 */
export async function automaticCheck(opts: AutoCheckOpts = defaultAutoCheckOpts): Promise<void> {
    const violations: AxeResults = [];
    const testPath = expect.getState().testPath;
    // If option to run only on selected files is specified, then current path should
    // match against at least one file
    if (opts.runOnlyOnFiles?.length && !opts.runOnlyOnFiles.some((fileName) => testPath.endsWith(fileName))) {
        log(
            `Skipping automatic accessibility check on ${testPath} as it does not match selected files provided: ${opts.runOnlyOnFiles.toString()}`
        );
        return;
    }

    // Skip automatic check if test is using fake timer as it would result in timeout
    if (isTestUsingFakeTimer()) {
        log('Skipping automatic accessibility check as Jest fake timer is in use.');
        return;
    }
    // Create a DOM walker filtering only elements (skipping text, comment nodes etc)
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
    let currNode = walker.firstChild();
    try {
        while (currNode !== null) {
            // TODO (spike): Use a logger lib with log levels selectable at runtime
            // console.log(
            //     `♿ [DEBUG] Automatically checking a11y of ${currNode.nodeName}
            //      for test "${expect.getState().currentTestName}"
            //      : ${expect.getState().testPath}`
            // );
            violations.push(...(await getViolationsJSDOM(currNode)));
            currNode = walker.nextSibling();
        }
    } finally {
        if (opts.cleanupAfterEach) document.body.innerHTML = ''; // remove non-element nodes
        // TODO (spike): Disable stack trace for automatic checks.
        //  Will this affect all errors globally?
        // Error.stackTraceLimit = 0;
        A11yError.checkAndThrow(violations, { deduplicate: opts.consolidateResults });
    }
}

/**
 * Register accessibility checks to be run automatically after each test
 * @param opts - Options for automatic checks {@link AutoCheckOpts}
 */
export function registerSa11yAutomaticChecks(opts: AutoCheckOpts = defaultAutoCheckOpts): void {
    if (opts.runAfterEach) {
        // TODO (fix): Make registration idempotent
        log('Registering sa11y checks to be run automatically after each test');
        afterEach(async () => {
            await automaticCheck(opts);
        });
    }
}
