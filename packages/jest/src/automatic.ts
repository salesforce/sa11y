/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from '@jest/globals';
import {
    defaultAutoCheckOpts,
    defaultRenderedDOMSaveOpts,
    mutationObserverCallback,
    observerOptions,
    runAutomaticCheck,
} from '@sa11y/matcher';
import { isTestUsingFakeTimer } from './matcher';
import type { AutoCheckOpts, RenderedDOMSaveOpts } from '@sa11y/matcher';

export function registerSa11yAutomaticChecks(
    opts: AutoCheckOpts = defaultAutoCheckOpts,
    renderedDOMSaveOpts: RenderedDOMSaveOpts = defaultRenderedDOMSaveOpts
): void {
    if (!opts.runAfterEach) return;

    const observer = new MutationObserver(mutationObserverCallback);
    beforeEach(() => {
        if (opts.runDOMMutationObserver) {
            observer.observe(document.body, observerOptions);
        }
    });

    afterEach(async () => {
        if (opts.runDOMMutationObserver) observer.disconnect();
        await runAutomaticCheck(
            opts,
            renderedDOMSaveOpts,
            expect.getState().testPath,
            expect.getState().currentTestName,
            isTestUsingFakeTimer
        );
    });
}
