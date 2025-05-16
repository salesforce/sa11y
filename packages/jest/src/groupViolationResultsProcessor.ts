/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { AggregatedResult, AssertionResult, TestResult } from '@jest/test-result';
import { log } from '@sa11y/common';
import { A11yError } from '@sa11y/format';
import { processA11yDetailsAndMessages } from '@sa11y/matcher';

type FailureDetail = {
    error?: A11yError;
};
interface FailureMatcherDetail {
    error?: {
        matcherResult?: {
            a11yError?: A11yError;
        };
    };
}

/**
 * Convert any a11y errors from test failures into their own test suite, results
 */
function processA11yErrors(results: AggregatedResult, testSuite: TestResult, testResult: AssertionResult) {
    const a11yFailureDetails: FailureDetail[] = [];
    const a11yFailureMessages: string[] = [];
    let a11yErrorsExist = false;

    testResult.failureDetails.forEach((failure) => {
        let error = (failure as FailureDetail).error;
        // If using circus test runner https://github.com/facebook/jest/issues/11405#issuecomment-843549606
        // TODO (code cov): Add test data covering the case for circus test runner
        /* istanbul ignore next */
        if (error === undefined) error = failure as A11yError;
        if (error.name === A11yError.name) {
            a11yErrorsExist = true;
            a11yFailureDetails.push({ ...(failure as FailureDetail) } as FailureDetail);
            processA11yDetailsAndMessages(error, a11yFailureMessages);
        }
    });
    if (!a11yErrorsExist) {
        testSuite.numFailingTests -= 1;
        results.numFailedTests -= 1;
        if (testSuite.numFailingTests === 0) results.numFailedTestSuites -= 1;
    }
    testResult.failureDetails = [...a11yFailureDetails];
    testResult.failureMessages = [...a11yFailureMessages];
    testResult.status = a11yFailureDetails.length === 0 ? 'passed' : testResult.status;
}

function processA11yMatcherErrors(results: AggregatedResult, testSuite: TestResult, testResult: AssertionResult) {
    const a11yFailureMessages: string[] = [];

    testResult.failureDetails.forEach((failure) => {
        const error = (failure as FailureMatcherDetail)?.error?.matcherResult?.a11yError as A11yError;
        if (error !== undefined) {
            processA11yDetailsAndMessages(error, a11yFailureMessages);
            testResult.failureMessages = [...a11yFailureMessages];
        }
    });
}

/**
 * Custom results processor for a11y results grouping the violations. Only affects JSON results file output.
 * To be used with jest cli options --json --outputFile
 *  e.g. jest --json --outputFile jestResults.json --testResultsProcessor `node_modules/@sa11y/jest/dist/groupViolationResultsProcessor.js`
 * Ref: https://jestjs.io/docs/configuration#testresultsprocessor-string
 *  - Mapping of AggregatedResult to JSON format to https://github.com/facebook/jest/blob/master/packages/jest-test-result/src/formatTestResults.ts
 */
export function resultsProcessor(results: AggregatedResult): AggregatedResult {
    log(`Processing ${results.numTotalTests} tests ..`);
    results.testResults // suite results
        .filter((testSuite) => testSuite.numFailingTests > 0)
        .forEach((testSuite) => {
            testSuite.testResults // individual test results
                .filter((testResult) => testResult.status === 'failed')
                .forEach((testResult) => {
                    processA11yErrors(results, testSuite, testResult);
                });
        });

    return results;
}

export function resultsProcessorManualChecks(results: AggregatedResult): AggregatedResult {
    log(`Processing ${results.numTotalTests} tests ..`);
    results.testResults // suite results
        .filter((testSuite) => testSuite.numFailingTests > 0)
        .forEach((testSuite) => {
            testSuite.testResults // individual test results
                .filter((testResult) => testResult.status === 'failed')
                .forEach((testResult) => {
                    processA11yMatcherErrors(results, testSuite, testResult);
                });
        });

    return results;
}
// The processor must be a node module that exports a function
// Explicitly typing the exports for Node.js compatibility
const exportedFunctions = {
    resultsProcessor,
    resultsProcessorManualChecks,
};

module.exports = exportedFunctions;
