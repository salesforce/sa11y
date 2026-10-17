/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from '@jest/globals';
import {
    registerRemoveChild,
    defaultSa11yOpts,
    improvedChecksFilter,
    updateAutoCheckOpts,
    registerCustomSa11yRules,
} from '@sa11y/matcher';
import { registerSa11yAutomaticChecks } from './automatic';
import { toBeAccessible } from './matcher';

export function setup(opts = defaultSa11yOpts): void {
    const testPath = expect.getState().testPath ?? '';
    const ignoreImprovedChecks = improvedChecksFilter.some((fileName) =>
        testPath.toLowerCase().includes(fileName.toLowerCase())
    );
    if (process.env.SA11Y_AUTO && !ignoreImprovedChecks) {
        registerRemoveChild();
    }
    registerSa11yMatcher();
    registerCustomSa11yRules();
    const autoCheckOpts = opts.autoCheckOpts;
    updateAutoCheckOpts(autoCheckOpts);

    const renderedDOMSaveOpts = opts.renderedDOMSaveOpts;
    registerSa11yAutomaticChecks(autoCheckOpts, renderedDOMSaveOpts);
}
export function registerSa11yMatcher(): void {
    if (expect !== undefined) {
        expect.extend({ toBeAccessible });
    } else {
        throw new Error(
            "Unable to find Jest's expect function." +
                '\nPlease check your Jest installation and that you have added @sa11y/jest correctly to your jest configuration.' +
                '\nSee https://github.com/salesforce/sa11y/tree/master/packages/jest#readme for help.'
        );
    }
}
