/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { AxeResults, log, useCustomRules } from '@sa11y/common';
import { getViolationsJSDOM } from '@sa11y/assert';
import { A11yError } from '@sa11y/format';
import { isTestUsingFakeTimer } from './matcher';
import { expect } from '@jest/globals';
import { adaptA11yConfig, adaptA11yConfigCustomRules } from './setup';
import { defaultRuleset } from '@sa11y/preset-rules';

/**
 * Options for Automatic checks to be passed to {@link registerSa11yAutomaticChecks}
 */
export type AutoCheckOpts = {
    runAfterEach?: boolean;
    cleanupAfterEach?: boolean;
    consolidateResults?: boolean;
    // TODO (feat): add support for optional exclusion of selected tests
    // excludeTests?: string[];
    // List of test file paths (as regex) to filter for automatic checks
    filesFilter?: string[];
};

/**
 * Default options when {@link registerSa11yAutomaticChecks} is invoked
 */
const defaultAutoCheckOpts: AutoCheckOpts = {
    runAfterEach: true,
    cleanupAfterEach: true,
    consolidateResults: true,
    filesFilter: [],
};

let originalDocumentBodyHtml: string | null = null;

export const setOriginalDocumentBodyHtml = (bodyHtml: string | null) => {
    originalDocumentBodyHtml = bodyHtml ?? null;
};

export const getOriginalDocumentBodyHtml = () => {
    return originalDocumentBodyHtml;
};

/**
 * Check if current test file needs to be skipped based on any provided filter
 */
export function skipTest(testPath: string | undefined, filesFilter?: string[]): boolean {
    if (!testPath || !filesFilter || !(filesFilter?.length > 0)) return false;
    const skipTest = filesFilter.some((fileName) => testPath.toLowerCase().includes(fileName.toLowerCase()));

    if (skipTest) {
        log(
            `Skipping automatic accessibility check on ${testPath} as it matches given files filter: ${filesFilter.toString()}`
        );
    }
    return skipTest;
}

/**
 * Run accessibility check on each element node in the body using {@link toBeAccessible}
 * @param opts - Options for automatic checks {@link AutoCheckOpts}
 */
export async function automaticCheck(opts: AutoCheckOpts = defaultAutoCheckOpts): Promise<void> {
    if (skipTest(expect.getState().testPath, opts.filesFilter)) return;

    // Skip automatic check if test is using fake timer as it would result in timeout
    if (isTestUsingFakeTimer()) {
        log('Skipping automatic accessibility check as Jest fake timer is in use.');
        return;
    }

    const violations: AxeResults = [];
    const currentDocumentHtml = document.body.innerHTML;
    if (originalDocumentBodyHtml) {
        document.body.innerHTML = originalDocumentBodyHtml;
    }
    // Create a DOM walker filtering only elements (skipping text, comment nodes etc)
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
    let currNode = walker.firstChild();
    const customRules = await useCustomRules();
    try {
        while (currNode !== null) {
            // TODO (spike): Use a logger lib with log levels selectable at runtime
            // console.log(
            //     `♿ [DEBUG] Automatically checking a11y of ${currNode.nodeName}
            //      for test "${expect.getState().currentTestName}"
            //      : ${testPath}`
            // );
            // W-10004832 - Exclude descendancy based rules from automatic checks
            if (customRules.length === 0)
                violations.push(...(await getViolationsJSDOM(currNode, adaptA11yConfig(defaultRuleset))));
            else
                violations.push(
                    ...(await getViolationsJSDOM(currNode, adaptA11yConfigCustomRules(defaultRuleset, customRules)))
                );
            currNode = walker.nextSibling();
        }
    } finally {
        setOriginalDocumentBodyHtml(null);
        document.body.innerHTML = currentDocumentHtml;
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
