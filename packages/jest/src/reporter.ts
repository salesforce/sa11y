/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Reporter, ReporterOnStartOptions } from '@jest/reporters';
import { AggregatedResult } from '@jest/test-result/build/types';
import { A11yError } from '@sa11y/format';
import { AxeResults } from '@sa11y/common';
import { writeFileSync } from 'fs';
import { A11yResult } from '@sa11y/format/dist/result';
import { Context } from '@jest/reporters/build/types';

type FailureDetail = {
    error?: A11yError;
};

/**
 * Custom Jest Reporter to output consolidated a11y issues as JSON file.
 * Notes:
 * 1. Reporter and tests are executed in their own sandboxes - objects cannot be mutated
 *  or propagated across including 'global' namespace. But reporter can read exception
 *  info thrown from tests.
 * 2. Values passed to reporter hooks are readonly. Modifications e.g. to test instance
 *  pass/fail status do not take effect in Jest.
 * 3. JSDOM environment is not available in reporter. Hence invoking automatic checks
 *  e.g. from within reporter hooks is not possible.
 * 4. Differences exist with default test runner vs Circus (next-gen) test runner
 *  https://github.com/facebook/jest/issues/11405
 */
export default class Sa11yReporter implements Reporter {
    static testCount = 0;
    static violations: AxeResults = [];
    static consolidated = new Map<string, Map<string, A11yResult>>();

    /**
     * Triggered after all tests have been executed.
     * Aggregated Result contains Error objects thrown from tests in addition to
     *  error messages. But only error messages are output by built-in json reporter.
     */
    onRunComplete(_contexts?: Set<Context>, results?: AggregatedResult): void {
        if (results?.numFailedTests === 0) return;
        results?.testResults
            .filter((testSuite) => testSuite.numFailingTests > 0)
            .forEach((testSuite) => {
                testSuite.testResults
                    .filter((testResult) => testResult.status === 'failed')
                    .forEach((testResult) => {
                        testResult.failureDetails.forEach((failure) => {
                            let error = (failure as FailureDetail).error;
                            // If using circus test runner https://github.com/facebook/jest/issues/11405#issuecomment-843549606
                            if (error === undefined) error = failure as A11yError;
                            if (error.name === A11yError.name) {
                                const violations = error.violations;
                                Sa11yReporter.violations.push(...violations);
                                Sa11yReporter.testCount += violations.length;
                            }
                        });
                    });
            });

        console.log('testCount', Sa11yReporter.testCount);
        console.log('violations', Sa11yReporter.violations);
        writeFileSync('sa11y.json', JSON.stringify(Sa11yReporter.violations, null, 2));
    }

    // Required methods in the Reporter interface - currently not being used in this reporter
    /* eslint-disable @typescript-eslint/no-empty-function */
    onRunStart(_results: AggregatedResult, _options: ReporterOnStartOptions): void | Promise<void> {}
    getLastError(): void | Error {}
    /* eslint-enable @typescript-eslint/no-empty-function */
}
