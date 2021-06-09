/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { addResult, createEmptyTestResult } from '@jest/test-result';
import { AggregatedResult, AssertionResult, TestResult } from '@jest/test-result/build/types';
import { errMsgHeader } from '@sa11y/common';
import { A11yError, A11yResult } from '@sa11y/format';

type FailureDetail = {
    error?: A11yError;
};

// Map of test suite name to test results
const consolidatedErrors = new Map<string, AssertionResult[]>();

/**
 * Create a test failure result for given a11y failure and add it to consolidated errors
 */
function createA11yTestResult(testSuite: TestResult, testResult: AssertionResult, a11yResult: A11yResult) {
    const suiteName = testSuite.testFilePath.substring(testSuite.testFilePath.lastIndexOf('/') + 1);
    const suiteKey = `[Sa11y ${a11yResult.wcag} ${a11yResult.id} ${suiteName}]`;
    if (!consolidatedErrors.has(suiteKey)) consolidatedErrors.set(suiteKey, []);
    consolidatedErrors.get(suiteKey)?.push({
        ...testResult,
        fullName: `${a11yResult.description}: ${a11yResult.selectors}`,
        failureMessages: [
            `${errMsgHeader}: ${a11yResult.description}
CSS Selectors: ${a11yResult.selectors}
HTML element: ${a11yResult.html}
Summary: ${a11yResult.summary}
Help: ${a11yResult.helpUrl}
Tests: ${testResult.fullName}`, // TODO (refactor): replace with array of tests when consolidating
        ],
        // We don't need the error objects anymore as they have been processed
        failureDetails: [],
        // Add all test's having the same a11y issue
        ancestorTitles: [...new Set(testResult.ancestorTitles).add(testResult.fullName)],
    } as AssertionResult);
}

/**
 * Convert any a11y errors from test failures into their own test suite, results
 */
function processA11yErrors(testSuite: TestResult, testResult: AssertionResult) {
    testResult.failureDetails.forEach((failure) => {
        let error = (failure as FailureDetail).error;
        // If using circus test runner https://github.com/facebook/jest/issues/11405#issuecomment-843549606
        if (error === undefined) error = failure as A11yError;
        if (error.name === A11yError.name) {
            // TODO : What happens if there are ever multiple failureDetails?
            //  Ideally there shouldn't be as test execution should be stopped on failure
            error.a11yResults.forEach((a11yResult) => {
                createA11yTestResult(testSuite, testResult, a11yResult);
            });
        }
    });
}

/**
 * Modify existing test suites, test results containing a11y errors after a11y errors
 *  are extracted out into their own test suites and results.
 */
function modifyTestSuiteResults(results: AggregatedResult, testSuite: TestResult, testResult: AssertionResult) {
    // Don't report the failure twice
    testResult.status = 'disabled';
    // TODO (fix): Remove sa11y msg from test suite message
    //  ANSI codes and test names in suite message makes it difficult
    //  Removing error from test result doesn't affect test suite error msg
    // testResult.failureMessages = [];
    // testResult.failureDetails = [];
    // testSuite.failureMessage = '';
    // Suites with only a11y errors should be marked as passed
    testSuite.numFailingTests -= 1;
    results.numFailedTests -= 1;
    if (testSuite.numFailingTests === 0) results.numFailedTestSuites -= 1;
    // TODO(debug): Does 'success' represent only failed tests?
    // if (results.numFailedTestSuites === 0) results.success = true;
}

/**
 * Custom results processor for a11y results. Only affects JSON results file output.
 * To be used with jest cli options --json --outputFile
 *  e.g. jest --json --outputFile jestResults.json --testResultsProcessor `node_modules/@sa11y/jest/dist/resultsProcessor.js`
 * Ref: https://jestjs.io/docs/configuration#testresultsprocessor-string
 *  - Mapping of AggregatedResult to JSON format to https://github.com/facebook/jest/blob/master/packages/jest-test-result/src/formatTestResults.ts
 */
export default function resultsProcessor(results: AggregatedResult): AggregatedResult {
    // TODO (refactor): Use map/filter to get results directly without global var for consolidated errors
    results.testResults // suite results
        .filter((testSuite) => testSuite.numFailingTests > 0)
        .forEach((testSuite) => {
            testSuite.testResults // individual test results
                .filter((testResult) => testResult.status === 'failed')
                .forEach((testResult) => {
                    processA11yErrors(testSuite, testResult);
                    modifyTestSuiteResults(results, testSuite, testResult);
                });
        });

    consolidatedErrors.forEach((testResults, suiteKey) => {
        const sa11ySuite = createEmptyTestResult();
        sa11ySuite.testFilePath = suiteKey;
        sa11ySuite.testResults = testResults;
        sa11ySuite.numFailingTests = testResults.length;
        addResult(results, sa11ySuite);
    });

    return results;
}

// The processor must be a node module that exports a function
module.exports = resultsProcessor;
