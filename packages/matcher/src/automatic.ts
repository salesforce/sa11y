/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { AxeResults, log, useCustomRules, writeHtmlFileInPath } from '@sa11y/common';
import { getA11yResultsJSDOM } from '@sa11y/assert';
import { A11yError, exceptionListFilterSelectorKeywords } from '@sa11y/format';
import {
    defaultRuleset,
    adaptA11yConfig,
    adaptA11yConfigCustomRules,
    adaptA11yConfigIncompleteResults,
} from '@sa11y/preset-rules';

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
    enableIncompleteResults?: boolean;
};

export type RenderedDOMSaveOpts = {
    renderedDOMDumpDirPath?: string;
    generateRenderedDOMFileSaveLocation?: (
        testFilePath: string,
        testName: string
    ) => { fileName: string; fileUrl: string };
};

/**
 * Default options when {@link registerSa11yAutomaticChecks} is invoked
 */
export const defaultAutoCheckOpts: AutoCheckOpts = {
    runAfterEach: true,
    cleanupAfterEach: true,
    consolidateResults: true,
    filesFilter: [],
    runDOMMutationObserver: false,
    enableIncompleteResults: false,
};

export const defaultRenderedDOMSaveOpts: RenderedDOMSaveOpts = {
    renderedDOMDumpDirPath: '',
};

let originalDocumentBodyHtml: string | null = null;
let mutatedNodes: string[] = [];

export const setOriginalDocumentBodyHtml = (bodyHtml: string | null) => {
    originalDocumentBodyHtml = bodyHtml ?? null;
};
export const getOriginalDocumentBodyHtml = () => originalDocumentBodyHtml;

/**
 * Check if current test file needs to be skipped based on any provided filter
 */
export function skipTest(testPath: string | undefined, filesFilter?: string[]): boolean {
    if (!testPath || !filesFilter || filesFilter.length === 0) return false;
    const skip = filesFilter.some((file) => testPath.toLowerCase().includes(file.toLowerCase()));
    if (skip) {
        log(
            `Skipping automatic accessibility check on ${testPath} as it matches given files filter: ${filesFilter.toString()}`
        );
    }
    return skip;
}

/**
 * Run accessibility check on each element node in the body using {@link toBeAccessible}
 * @param opts - Options for automatic checks {@link AutoCheckOpts}
 */
export async function runAutomaticCheck(
    opts: AutoCheckOpts = defaultAutoCheckOpts,
    renderedDOMSaveOpts: RenderedDOMSaveOpts = defaultRenderedDOMSaveOpts,
    testPath = '',
    testName = '',
    isFakeTimerUsed: () => boolean = () => false
): Promise<void> {
    if (skipTest(testPath, opts.filesFilter)) return;

    // Skip automatic check if test is using fake timer as it would result in timeout
    if (isFakeTimerUsed()) {
        log('Skipping automatic accessibility check due to fake timer usage.');
        return;
    }

    const customRules = useCustomRules();
    let config =
        customRules.length === 0
            ? adaptA11yConfig(defaultRuleset)
            : adaptA11yConfigCustomRules(defaultRuleset, customRules);
    if (opts.enableIncompleteResults) config = adaptA11yConfigIncompleteResults(config);

    let a11yResults: AxeResults = [];
    const currentHtml = document.body.innerHTML;
    if (originalDocumentBodyHtml) document.body.innerHTML = originalDocumentBodyHtml;

    // Create a DOM walker filtering only elements (skipping text, comment nodes etc)
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
    let currNode = walker.firstChild();
    let renderedDOMSavedFileName = '';
    try {
        if (!opts.runDOMMutationObserver) {
            while (currNode) {
                // TODO (spike): Use a logger lib with log levels selectable at runtime
                // console.log(
                //     `♿ [DEBUG] Automatically checking a11y of ${currNode.nodeName}
                //      for test "${expect.getState().currentTestName}"
                //      : ${testPath}`
                // );
                // W-10004832 - Exclude descendancy based rules from automatic checks
                a11yResults.push(...(await getA11yResultsJSDOM(currNode, config, opts.enableIncompleteResults)));
                currNode = walker.nextSibling();
            }
        } else {
            const a11yResultsJSDOM = await getA11yResultsJSDOM(document.body, config, opts.enableIncompleteResults);
            if (a11yResultsJSDOM?.length > 0) {
                if (
                    !!renderedDOMSaveOpts.renderedDOMDumpDirPath &&
                    !!renderedDOMSaveOpts.generateRenderedDOMFileSaveLocation
                ) {
                    try {
                        // save the document body HTML
                        if (!testPath || !testName) {
                            console.log(
                                `Skipping saving rendered DOM HTML as one or both of test file path and test name are empty`
                            );
                        } else {
                            const { fileName, fileUrl } = renderedDOMSaveOpts.generateRenderedDOMFileSaveLocation(
                                testPath,
                                testName
                            );
                            renderedDOMSavedFileName = fileUrl;
                            writeHtmlFileInPath(
                                renderedDOMSaveOpts.renderedDOMDumpDirPath,
                                fileName,
                                document.body.innerHTML
                            );
                        }
                    } catch (e) {
                        console.log(`ran into an error while saving rendered DOM - ${(e as Error).message}`);
                    }
                }
            }
            a11yResults.push(...a11yResultsJSDOM);
            document.body.innerHTML = '';
            // loop mutated nodes
            for await (const mutated of mutatedNodes) {
                if (mutated) {
                    document.body.innerHTML = mutated;
                    a11yResults.push(
                        ...(await getA11yResultsJSDOM(document.body, config, opts.enableIncompleteResults))
                    );
                }
            }
        }
    } finally {
        if (opts.runDOMMutationObserver) mutatedNodes = [];
        setOriginalDocumentBodyHtml(null);
        document.body.innerHTML = currentHtml;
        if (opts.cleanupAfterEach) document.body.innerHTML = ''; // remove non-element nodes
        // TODO (spike): Disable stack trace for automatic checks.
        //  Will this affect all errors globally?
        // Error.stackTraceLimit = 0;
        if (process.env.SELECTOR_FILTER_KEYWORDS) {
            a11yResults = exceptionListFilterSelectorKeywords(
                a11yResults,
                process.env.SELECTOR_FILTER_KEYWORDS.split(',')
            );
        }
        A11yError.checkAndThrow(a11yResults, { deduplicate: opts.consolidateResults, renderedDOMSavedFileName });
    }
}

export function mutationObserverCallback(mutations: MutationRecord[]) {
    for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
            if (node?.parentElement?.innerHTML) {
                mutatedNodes.push(node.parentElement.innerHTML);
            } else if ((node as Element)?.outerHTML) {
                mutatedNodes.push((node as Element).outerHTML);
            }
        });
    }
}

// https://developer.mozilla.org/en-US/docs/Web/API/MutationObserverInit
export const observerOptions: MutationObserverInit = {
    subtree: true, // extend monitoring to the entire subtree of nodes rooted at target
    childList: true, // monitor target node for addition/removal of child nodes
    attributes: true, // monitor changes to the value of attributes of nodes
    characterData: true, // monitor changes to the character data contained within nodes
};
