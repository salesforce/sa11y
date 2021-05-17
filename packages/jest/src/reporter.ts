/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Reporter, ReporterOnStartOptions, Test } from '@jest/reporters';
import { AggregatedResult, TestCaseResult } from '@jest/test-result/build/types';
import { A11yError } from '@sa11y/format';
import { AxeResults } from '@sa11y/common';
import { writeFileSync } from 'fs';

/**
 * Custom Jest Reporter to output consolidated a11y issues as JSON file.
 * Notes:
 * 1. Reporter and tests are executed in their own sandboxes - objects cannot be mutated
 *  or propagated across. Only way to communicate is via exception thrown from tests
 *  which is accessible as part of the test instance in reporter.
 * 2. Values passed to reporter hooks are readonly. Modifications e.g. to test instance
 *  pass/fail status do not take effect in Jest.
 * 3. JSDOM environment is not available in reporter. Hence invoking automatic checks
 *  e.g. from within reporter hooks is not possible.
 */
export default class Sa11yReporter implements Reporter {
    static testCount = 0;
    static violations: AxeResults = [];

    /**
     * Triggered at end of each test
     * @param test - readonly instance containing test path, context and duration
     * @param testCaseResult - readonly instance containing result of test run
     * TODO(Debug): Not able to get this hook to trigger from jest with
     *  default test runner https://github.com/facebook/jest/issues/11405
     */
    onTestCaseResult(test: Test, testCaseResult: TestCaseResult): void {
        if (testCaseResult.status === 'failed') {
            testCaseResult.failureDetails.forEach((failure) => {
                // TODO: instanceof check doesn't work for A11yError
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore TS2339: Property 'name' does not exist on type 'Object'.
                if (failure instanceof Object && failure.name === A11yError.name) {
                    const violations = (failure as A11yError).violations;
                    Sa11yReporter.violations.push(...violations);
                    Sa11yReporter.testCount += violations.length;
                }
            });
        }
    }

    /**
     * Triggered after all tests have been executed.
     */
    onRunComplete(): void {
        console.log('testCount', Sa11yReporter.testCount);
        console.log('violations', Sa11yReporter.violations);
        writeFileSync('sa11y.json', JSON.stringify(Sa11yReporter.violations, null, 2));
    }

    // Required methods in the Reporter interface - currently not being used in this reporter
    /* eslint-disable @typescript-eslint/no-empty-function */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onRunStart(results: AggregatedResult, options: ReporterOnStartOptions): void | Promise<void> {}
    getLastError(): void | Error {}
    /* eslint-enable @typescript-eslint/no-empty-function */
}
