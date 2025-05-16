/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

export { fakeTimerErrMsg, runA11yCheck, formatOptions } from './matcher';
export {
    defaultAutoCheckOpts,
    mutationObserverCallback,
    observerOptions,
    skipTest,
    runAutomaticCheck,
    AutoCheckOpts,
} from './automatic';
export {
    registerRemoveChild,
    defaultSa11yOpts,
    improvedChecksFilter,
    updateAutoCheckOpts,
    registerCustomSa11yRules,
} from './setup';
export { createA11yErrorElements, processA11yDetailsAndMessages, ErrorElement } from './groupViolationResultsProcessor';
