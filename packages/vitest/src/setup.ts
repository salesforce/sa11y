/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { beforeEach, expect } from 'vitest';
import { getCurrentTest } from 'vitest/suite';
import {
    registerRemoveChild,
    defaultSa11yOpts,
    improvedChecksFilter,
    updateAutoCheckOpts,
    registerCustomSa11yRules,
    setOriginalDocumentBodyHtml,
} from '@sa11y/matcher';
import { registerSa11yAutomaticChecks } from './automatic.js';
import { toBeAccessible } from './matcher.js';

export function setup(opts = defaultSa11yOpts): void {
    const testPath = expect.getState().testPath ?? '';
    const ignoreImprovedChecks = improvedChecksFilter.some((fileName) =>
        testPath.toLowerCase().includes(fileName.toLowerCase())
    );

    if (process.env.SA11Y_AUTO && !ignoreImprovedChecks) {
        registerDOMSave();
    }

    registerSa11yMatcher();
    registerCustomSa11yRules();

    const autoCheckOpts = opts.autoCheckOpts;
    updateAutoCheckOpts(autoCheckOpts);

    const renderedDOMSaveOpts = opts.renderedDOMSaveOpts;
    registerSa11yAutomaticChecks(autoCheckOpts, renderedDOMSaveOpts);
}

/**
 * Save the DOM for the automatic checks when the first node is removed after the test, e.g. by the
 * cleanup of a testing library in an afterEach hook running before the automatic checks.
 * Nodes removed during the test, e.g. when components re-render, don't save the DOM as it isn't
 * final yet.
 */
function registerDOMSave(): void {
    registerRemoveChild(isAfterEachRunning);
    // Don't check a DOM saved in a previous test, e.g. when its automatic checks were skipped
    beforeEach(() => {
        setOriginalDocumentBodyHtml(null);
    });
}

/**
 * Check if the afterEach hooks of the current test are running.
 * - Vitest sets the test state from "run" to e.g. "pass" or "fail" before running the afterEach hooks.
 *   The afterEach hook state is checked too as `expect.soft` sets the test state to "fail" during the test.
 * - The test state is checked too as the afterEach hook state stays "run" when a hook fails, e.g. with
 *   a11y issues found by the automatic checks, until the hooks run again when the test is retried.
 */
function isAfterEachRunning(): boolean {
    const result = getCurrentTest()?.result;
    return !!result && result.state !== 'run' && result.hooks?.afterEach === 'run';
}

export function registerSa11yMatcher(): void {
    if (expect !== undefined) {
        expect.extend({ toBeAccessible });
    } else {
        throw new Error(
            "Unable to find vitest's expect function." +
                '\nPlease check your vitest installation and that you have added @sa11y/vitest correctly to your vitest configuration.' +
                '\nSee https://github.com/salesforce/sa11y/tree/master/packages/vitest#readme for help.'
        );
    }
}
