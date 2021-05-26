/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Config, Reporter, ReporterOnStartOptions } from '@jest/reporters';
import { AggregatedResult } from '@jest/test-result/build/types';
import { Context } from '@jest/reporters/build/types';
import { A11yError, ConsolidatedResults } from '@sa11y/format';
import { writeFileSync } from 'fs';

type FailureDetail = {
    error?: A11yError;
};

type Options = {
    outputFile: string;
};

const defaultOpts: Options = {
    outputFile: 'sa11y_results.json',
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
    constructor(_globalConfig: Config.GlobalConfig, private options: Options) {
        this.options = { ...defaultOpts, ...options };
    }

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
                                ConsolidatedResults.convert(error.violations, testSuite.testFilePath);
                            }
                        });
                    });
            });

        writeFileSync(this.options.outputFile, JSON.stringify(ConsolidatedResults.a11yResults, null, 2));
        console.log(`${Sa11yReporter.name} results written to`, this.options.outputFile);
    }

    // Required methods in the Reporter interface - currently not being used in this reporter
    /* eslint-disable @typescript-eslint/no-empty-function */
    onRunStart(_results: AggregatedResult, _options: ReporterOnStartOptions): void | Promise<void> {}
    getLastError(): void | Error {}
    /* eslint-enable @typescript-eslint/no-empty-function */
}
