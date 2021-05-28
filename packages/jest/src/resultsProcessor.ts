/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { AggregatedResult } from '@jest/test-result/build/types';
import { TestResult } from '@jest/reporters';
import { A11yError } from '@sa11y/format';

type FailureDetail = {
    error?: A11yError;
};

/**
 * Custom results processor for a11y results. Only affects JSON results file output.
 * To be used with jest cli options --json --outputFile
 *  e.g. jest --json --outputFile jestResults.json --testResultsProcessor node_modules/@sa11y/jest/dist/resultsProcessor.js
 * Ref: https://jestjs.io/docs/configuration#testresultsprocessor-string
 *  - Mapping of AggregatedResult to JSON format to https://github.com/facebook/jest/blob/master/packages/jest-test-result/src/formatTestResults.ts
 */
export function resultsProcessor(results: AggregatedResult): AggregatedResult {
    const sa11yResults = [] as TestResult[];

    results.testResults
        .filter((testSuite) => testSuite.numFailingTests > 0)
        .forEach((testSuite) => {
            const sa11yTestSuite = { ...testSuite };
            sa11yTestSuite.testResults = [];
            testSuite.testResults
                .filter((testResult) => testResult.status === 'failed')
                .forEach((testResult) => {
                    testResult.failureDetails.forEach((failure) => {
                        let error = (failure as FailureDetail).error;
                        // If using circus test runner https://github.com/facebook/jest/issues/11405#issuecomment-843549606
                        if (error === undefined) error = failure as A11yError;
                        if (error.name === A11yError.name) {
                            sa11yTestSuite.testResults.push(testResult);
                        }
                    });
                });
            if (sa11yTestSuite.testResults.length > 0) sa11yResults.push(sa11yTestSuite);
        });

    results.testResults.push(...sa11yResults);
    return results;
}

// The processor must be a node module that exports a function
module.exports = resultsProcessor;
