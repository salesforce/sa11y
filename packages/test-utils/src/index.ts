/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

export {
    audioURL,
    domWithA11yIssues,
    domWithA11yIssuesBodyID,
    domWithNoA11yIssues,
    htmlFileWithA11yIssues,
    htmlFileWithNoA11yIssues,
    a11yIssuesCount,
    shadowDomID,
    videoURL,
} from './test-data';
export { beforeEachSetup, cartesianProduct, checkA11yError } from './utils';
export { setupWDIO, teardownWDIO } from './wdio';
