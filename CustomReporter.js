/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
class CustomReporter {
    /**
     * Hook triggered at end of each test
     * TODO(Debug): Not able to get this hook to trigger from jest
     */
    onTestCaseResult(test, testCaseResult) {
        console.log('onTestCaseResult');
    }
}

module.exports = CustomReporter;
