/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { beforeEach, afterEach, expect } from 'vitest';
import { defaultAutoCheckOpts, mutationObserverCallback, observerOptions, runAutomaticCheck } from '@sa11y/matcher';
import type { AutoCheckOpts } from '@sa11y/matcher';
import { isTestUsingFakeTimer } from './matcher.js';

export function registerSa11yAutomaticChecks(opts: AutoCheckOpts = defaultAutoCheckOpts): void {
    if (!opts.runAfterEach) return;
    // TODO (fix): Make registration idempotent
    const observer = new MutationObserver(mutationObserverCallback);

    beforeEach(() => {
        if (opts.runDOMMutationObserver) {
            observer.observe(document.body, observerOptions);
        }
    });

    afterEach(async () => {
        if (opts.runDOMMutationObserver) observer.disconnect(); // stop mutation observer
        await runAutomaticCheck(opts, expect.getState().testPath, isTestUsingFakeTimer);
    });
}
