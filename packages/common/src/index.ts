/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

export {
    A11yConfig,
    AxeResults,
    axeIncompleteResults,
    axeRuntimeExceptionMsgPrefix,
    axeVersion,
    getAxeRules,
    getViolations,
    getIncomplete,
} from './axe';
export { WdioAssertFunction, WdioOptions } from './wdio';
export { errMsgHeader, ExceptionList } from './format';
export {
    log,
    useFilesToBeExempted,
    useCustomRules,
    processFiles,
    registerCustomRules,
    writeHtmlFileInPath,
    type ErrorElement,
    type A11yViolation,
    createA11yRuleViolation,
    createA11yErrorElements,
} from './helpers';
