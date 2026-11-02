/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { afterEach, expect } from 'vitest';
import { defaultAutoCheckOpts, defaultRenderedDOMSaveOpts, runAutomaticCheck } from '@sa11y/matcher';
import type { AutoCheckOpts, RenderedDOMSaveOpts } from '@sa11y/matcher';
import { isTestUsingFakeTimer } from './matcher.js';

export function registerSa11yAutomaticChecks(
    opts: AutoCheckOpts = defaultAutoCheckOpts,
    renderedDOMSaveOpts: RenderedDOMSaveOpts = defaultRenderedDOMSaveOpts
): void {
    if (!opts.runAfterEach) return;
    // TODO (fix): Make registration idempotent
    afterEach(async () => {
        await runAutomaticCheck(
            // DOM mutation observer mode is not supported. Turn it off as updateAutoCheckOpts()
            // also turns it on with the SA11Y_ENABLE_DOM_MUTATION_OBSERVER env var.
            { ...opts, runDOMMutationObserver: false },
            renderedDOMSaveOpts,
            expect.getState().testPath,
            expect.getState().currentTestName,
            isTestUsingFakeTimer
        );
    });
}
