/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Config, Reporter, ReporterOnStartOptions, TestResult } from '@jest/reporters';
import { AggregatedResult, AssertionResult } from '@jest/test-result/build/types';
import { Context } from '@jest/reporters/build/types';
import { A11yError, ConsolidatedResults } from '@sa11y/format';
import { writeFileSync } from 'fs';
import xml from 'xml';

type FailureDetail = {
    error?: A11yError;
};

type Options = {
    outputFile: string;
    outputFormat: 'json' | 'xml';
    suiteName: string;
};

const defaultOpts: Options = {
    outputFile: 'sa11y_results',
    outputFormat: 'json',
    suiteName: 'sa11y-accessibility-failures',
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

    initXmlResults(results: AggregatedResult) {
        return {
            testsuite: [
                {
                    _attr: {
                        name: this.options.suiteName,
                        failures: results.numFailedTests,
                        errors: results.numRuntimeErrorTestSuites,
                        tests: results.numTotalTests,
                    },
                },
            ],
        };
    }

    initTestCaseResult(testSuite: TestResult, testResult: AssertionResult) {
        return {
            testcase: [
                {
                    _attr: {
                        classname: testSuite.testFilePath,
                        name: testResult.fullName.replace(/ /g, '_'),
                    },
                },
            ],
        };
    }

    addTestFailure(testResult: AssertionResult) {
        const errMsg = testResult.failureMessages[0];
        const firstLineErrMsg = errMsg.substring(0, errMsg.indexOf('\n'));
        return {
            failure: [
                {
                    _attr: {
                        message: firstLineErrMsg,
                    },
                },
                errMsg,
            ],
        };
    }

    /**
     * Triggered after all tests have been executed.
     * Results are aggregated from Error objects thrown from tests.
     */
    onRunComplete(_contexts?: Set<Context>, results?: AggregatedResult): void {
        if (results === undefined || results.numFailedTests === 0) return;

        const xmlResults = this.initXmlResults(results);
        results?.testResults
            .filter((testSuite) => testSuite.numFailingTests > 0)
            .forEach((testSuite) => {
                testSuite.testResults
                    .filter((testResult) => testResult.status === 'failed')
                    .forEach((testResult) => {
                        const xmlTestCaseResult = this.initTestCaseResult(testSuite, testResult);
                        testResult.failureDetails.forEach((failure) => {
                            let error = (failure as FailureDetail).error;
                            // If using circus test runner https://github.com/facebook/jest/issues/11405#issuecomment-843549606
                            if (error === undefined) error = failure as A11yError;
                            if (error.name === A11yError.name) {
                                ConsolidatedResults.convert(error.violations, testSuite.testFilePath);
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore TS2345: Argument of type is not assignable to parameter of type ...
                                xmlTestCaseResult.testcase.push(this.addTestFailure(testResult));
                            }
                        });
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        xmlResults.testsuite.push(xmlTestCaseResult);
                    });
            });

        const outputFile = `${this.options.outputFile}.${this.options.outputFormat}`;
        if (this.options.outputFormat === 'json') writeFileSync(outputFile, JSON.stringify(xmlResults, null, 2));

        if (this.options.outputFormat === 'xml') writeFileSync(outputFile, xml(xmlResults, { indent: ' ' }));

        console.log(`${Sa11yReporter.name} results written to`, outputFile);
    }

    // Required methods in the Reporter interface - currently not being used in this reporter
    /* eslint-disable @typescript-eslint/no-empty-function */
    onRunStart(_results: AggregatedResult, _options: ReporterOnStartOptions): void | Promise<void> {}
    getLastError(): void | Error {}
    /* eslint-enable @typescript-eslint/no-empty-function */
}
