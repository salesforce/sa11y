/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Test, TestResult } from '@jest/reporters';

export default class Sa11yReporter {
    /**
     * Hook triggered at end of each test
     * TODO(Debug): Not able to get this hook to trigger from jest
     */
    onTestCaseResult(test: Test, testCaseResult: TestResult) {
        console.log('onTestCaseResult');
    }
}
