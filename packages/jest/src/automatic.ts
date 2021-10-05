/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { AxeResults, log } from '@sa11y/common';
import { getViolationsJSDOM } from '@sa11y/assert';
import { A11yError } from '@sa11y/format';
import { defaultRuleset } from '@sa11y/preset-rules';
import { isTestUsingFakeTimer } from './matcher';
import { Mutex, withTimeout, E_CANCELED } from 'async-mutex';

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

/**
 * Run accessibility check on each element node in the body using {@link toBeAccessible}
 * @param opts - Options for automatic checks {@link AutoCheckOpts}
 */
export async function automaticCheck(opts: AutoCheckOpts = defaultAutoCheckOpts): Promise<void> {
    const violations: AxeResults = [];
    const testPath = expect.getState().testPath;
    // If option to run only on selected files is specified, then current path should
    // match against at least one file
    if (
        opts.filesFilter?.length &&
        !opts.filesFilter
            // Convenience shortcut converting '!' prefix to filename
            // as negative lookahead assertion regex
            .map((filename) => (filename.startsWith('!') ? `/(?!${filename})$` : filename))
            .some((fileName) => RegExp(fileName).test(testPath))
    ) {
        log(
            `Skipping automatic accessibility check on ${testPath} as it does not match selected files provided: ${opts.filesFilter.toString()}`
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
            //      : ${testPath}`
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

// https://thoughtspile.github.io/2018/06/20/serialize-promises/
// function serializePromises(immediate: CallableFunction) {
//     // This works as our promise queue
//     let last = Promise.resolve();
//     return function (...a) {
//         // Catch is necessary here — otherwise a rejection in a promise will
//         // break the serializer forever
//         last = last.catch(() => {}).then(() => immediate(...a));
//         return last;
//     };
// }

// https://advancedweb.hu/how-to-serialize-calls-to-an-async-function/
// const serializePromises = (fn: CallableFunction) => {
//     // Start of the queue. Every other call is appended to this Promise.
//     let queue = Promise.resolve();
//     return (...args: any[]) => {
//         // Adds the function call to the queue and saves its result.
//         // Will be resolved when the current and all the previous calls are resolved.
//         const result = queue.then(() => fn(...args));
//         // Makes sure that the queue won’t get stuck in rejection when one part of it is rejected.
//         queue = result.catch((err) => {
//             console.log(err);
//         });
//         return result;
//     };
// };

const mutexTimeout = 5000;
const mutex = withTimeout(new Mutex(), mutexTimeout, new Error('Timed-out waiting for axe'));

function observerCallback(mutations: MutationRecord[], _observer: MutationObserver) {
    const violations: AxeResults = []; // TODO (refactor): move to global/test scope
    for (const mutation of mutations) {
        // log('Mutation event triggered on', mutation.target.nodeName);
        for (const node of mutation.addedNodes) {
            // console.log('Added node', node.nodeName);
            // console.log('Waiting for axe', mutex.isLocked());
            //
            // 1. Serialize axe invocations using a Promise queue
            // const getViolationsSerialized = serializePromises(getViolationsJSDOM);
            // void getViolationsSerialized(node).then((results) => violations.push(...results));
            //
            //
            // 2. Use array reduce to serialize axe invocation.
            //  But this wouldn't serialize across multiple mutation callbacks.
            // const resultsPromise = Array.from(mutation.addedNodes).reduce(
            //     (prevPromise, node) => {
            //         return prevPromise.then(() => {
            //             return getViolationsJSDOM(node);
            //         });
            //     },
            //     Promise.resolve()
            //     // Promise.resolve(violations).then((results) => violations.push(...results))
            // );
            // resultsPromise.then((results: AxeResults) => violations.push(...results));
            //
            //
            // 3. Wrap axe invocation with a mutex
            // schedules getViolationsJSDOM to be run once the mutex is unlocked
            // void mutex
            //     .runExclusive(() => getViolationsJSDOM(node))
            getViolationsJSDOM(node, defaultRuleset, mutex)
                .then((results) => violations.push(...results))
                .catch((err) => {
                    if (err == E_CANCELED) {
                        console.log('Mutex cancelled');
                        return;
                    }
                    console.log('Error:', err);
                });
        }
    }

    A11yError.checkAndThrow(violations);
}

// https://developer.mozilla.org/en-US/docs/Web/API/MutationObserverInit
const observerOptions: MutationObserverInit = {
    subtree: false, // extend monitoring to the entire subtree of nodes rooted at target
    childList: true, // monitor target node for addition/removal of child nodes
    // TODO (feat): Add option to enable monitoring selected attribute changes
    attributes: false, // monitor changes to the value of attributes of nodes
    characterData: false, // monitor changes to the character data contained within nodes
};

/**
 * Register accessibility checks to be run automatically after each test
 * @param opts - Options for automatic checks {@link AutoCheckOpts}
 */
export function registerSa11yAutomaticChecks(opts: AutoCheckOpts = defaultAutoCheckOpts): void {
    if (opts.runAfterEach) {
        // TODO (config): Add another option 'runAfterMutation' for mutation observer
        // TODO (fix): Make registration idempotent
        const observer = new MutationObserver(observerCallback);
        log('Registering sa11y checks to be run automatically after each test');
        beforeEach(() => {
            observer.observe(document.body, observerOptions);
        });

        afterEach(() => {
            observer.disconnect(); // stop mutation observer
            // Give time for mutex executions to complete
            // await new Promise((r) => setTimeout(r, mutexTimeout));
            // await mutex.waitForUnlock();
            mutex.cancel(); // cancelling pending locks
            // await automaticCheck(opts);
        });
    }
}
