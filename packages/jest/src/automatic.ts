/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { AxeResults, log, useCustomRules } from '@sa11y/common';
import { getViolationsJSDOM } from '@sa11y/assert';
import { A11yError, exceptionListFilterSelectorKeywords } from '@sa11y/format';
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
    runDOMMutationObserver?: boolean;
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

let mutatedNodes: string[] = [];

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

    let violations: AxeResults = [];
    const currentDocumentHtml = document.body.innerHTML;
    if (originalDocumentBodyHtml) {
        document.body.innerHTML = originalDocumentBodyHtml;
    }
    // Create a DOM walker filtering only elements (skipping text, comment nodes etc)
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
    let currNode = walker.firstChild();
    let customRules = useCustomRules();
    try {
        if (!opts.runDOMMutationObserver) {
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
        } else {
            customRules = [];
            if (customRules.length === 0)
                violations.push(...(await getViolationsJSDOM(document.body, adaptA11yConfig(defaultRuleset))));
            else
                violations.push(
                    ...(await getViolationsJSDOM(
                        document.body,
                        adaptA11yConfigCustomRules(defaultRuleset, customRules)
                    ))
                );
            document.body.innerHTML = '';
            // loop mutated nodes
            for await (const mutatedNode of mutatedNodes) {
                if (mutatedNode) {
                    document.body.innerHTML = mutatedNode;
                    // const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
                    // let currNode = walker.firstChild();
                    // while (currNode !== null) {
                    if (customRules.length === 0)
                        violations.push(...(await getViolationsJSDOM(document.body, adaptA11yConfig(defaultRuleset))));
                    else
                        violations.push(
                            ...(await getViolationsJSDOM(
                                document.body,
                                adaptA11yConfigCustomRules(defaultRuleset, customRules)
                            ))
                        );
                    // currNode = walker.nextSibling();
                    // }
                }
            }
        }
    } finally {
        if (opts.runDOMMutationObserver) {
            mutatedNodes = [];
        }
        setOriginalDocumentBodyHtml(null);
        document.body.innerHTML = currentDocumentHtml;
        if (opts.cleanupAfterEach) document.body.innerHTML = ''; // remove non-element nodes
        // TODO (spike): Disable stack trace for automatic checks.
        //  Will this affect all errors globally?
        // Error.stackTraceLimit = 0;
        if (process.env.SELECTOR_FILTER_KEYWORDS) {
            violations = exceptionListFilterSelectorKeywords(
                violations,
                process.env.SELECTOR_FILTER_KEYWORDS.split(',')
            );
        }
        A11yError.checkAndThrow(violations, { deduplicate: opts.consolidateResults });
    }
}

function observerCallback(mutations: MutationRecord[], _observer: MutationObserver) {
    for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
            if (node?.parentElement?.innerHTML) {
                mutatedNodes.push(node.parentElement.innerHTML);
            } else if ((node as Element)?.outerHTML) {
                mutatedNodes.push((node as Element)?.outerHTML);
            }
        });
    }
}

// https://developer.mozilla.org/en-US/docs/Web/API/MutationObserverInit
const observerOptions: MutationObserverInit = {
    subtree: true, // extend monitoring to the entire subtree of nodes rooted at target
    childList: true, // monitor target node for addition/removal of child nodes
    attributes: true, // monitor changes to the value of attributes of nodes
    characterData: true, // monitor changes to the character data contained within nodes
};

/**
 * Register accessibility checks to be run automatically after each test
 * @param opts - Options for automatic checks {@link AutoCheckOpts}
 */
export function registerSa11yAutomaticChecks(opts: AutoCheckOpts = defaultAutoCheckOpts): void {
    if (opts.runAfterEach) {
        const observer = new MutationObserver(observerCallback);
        // TODO (fix): Make registration idempotent
        log('Registering sa11y checks to be run automatically after each test');

        beforeEach(() => {
            if (opts.runDOMMutationObserver) {
                observer.observe(document.body, observerOptions);
            }
        });

        afterEach(async () => {
            if (opts.runDOMMutationObserver) {
                observer.disconnect(); // stop mutation observer
            }
            await automaticCheck(opts);
        });
    }
}
