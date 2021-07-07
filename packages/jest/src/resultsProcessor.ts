/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { AggregatedResult, AssertionResult, TestResult, addResult, createEmptyTestResult } from '@jest/test-result';
import { errMsgHeader, log } from '@sa11y/common';
import { A11yError, A11yResult, A11yResults } from '@sa11y/format';

type FailureDetail = {
    error?: A11yError;
};

// Map of test suite name to test results
const consolidatedErrors = new Map<string, AssertionResult[]>();

/**
 * Create a test failure result with a11y meta-data at forefront from given test failure
 * with a11y error.
 */
function createA11yTestResult(testResult: AssertionResult, a11yResult: A11yResult): AssertionResult {
    return {
        ...testResult,
        // TODO (refactor): extract formatting into its own function.
        //  - Can this satisfy Formatter interface?
        //  - Be part of format? (FileFormatter vs ConsoleFormatter)?
        fullName: `[Sa11y-${a11yResult.wcag}]${a11yResult.description}:${a11yResult.selectors}`,
        failureMessages: [
            `${errMsgHeader}: ${a11yResult.description}
CSS Selectors: ${a11yResult.selectors}
HTML element: ${a11yResult.html}
Help: ${a11yResult.helpUrl}
Tests: "${testResult.fullName}"
Summary: ${a11yResult.summary}`, // TODO (refactor): replace with array of tests when consolidating? But we reach here after de-duping a11y results?
        ],
        // We don't need the error objects anymore as they have been processed
        failureDetails: [],
        // Add all test's having the same a11y issue
        ancestorTitles: [...new Set(testResult.ancestorTitles).add(testResult.fullName)],
    } as AssertionResult;
}

/**
 * Convert any a11y errors from test failures into their own test suite, results
 */
function processA11yErrors(testSuite: TestResult, testResult: AssertionResult) {
    const suiteName = testSuite.testFilePath;

    testResult.failureDetails.forEach((failure) => {
        let error = (failure as FailureDetail).error;
        // If using circus test runner https://github.com/facebook/jest/issues/11405#issuecomment-843549606
        // TODO (code cov): Add test data covering the case for circus test runner
        /* istanbul ignore next */
        if (error === undefined) error = failure as A11yError;
        if (error.name === A11yError.name) {
            // TODO (spike) : What happens if there are ever multiple failureDetails?
            //  Ideally there shouldn't be as test execution should be stopped on failure
            A11yResults.add(error.a11yResults, suiteName).forEach((a11yResult) => {
                // TODO (code cov): Fix - should be covered by existing tests
                /* istanbul ignore next */
                if (!Array.isArray(consolidatedErrors.get(suiteName))) consolidatedErrors.set(suiteName, []);
                consolidatedErrors.get(suiteName)?.push(createA11yTestResult(testResult, a11yResult));
            });
        }
    });
}

/**
 * Modify existing test result containing a11y error after a11y error
 *  is extracted into its own test result using {@link createA11yTestResult}.
 */
function modifyOriginalTestResult(results: AggregatedResult, testSuite: TestResult, testResult: AssertionResult) {
    // Don't report the failure twice
    testResult.status = 'disabled';
    // TODO (fix): Remove sa11y msg from test suite message.
    //  ANSI codes and test names in suite message makes it difficult.
    //  Removing error from test result doesn't affect test suite error msg.
    // testResult.failureMessages = [];
    // testResult.failureDetails = [];
    // testSuite.failureMessage = '';
    // Suites with only a11y errors should be marked as passed
    testSuite.numFailingTests -= 1;
    results.numFailedTests -= 1;
    if (testSuite.numFailingTests === 0) results.numFailedTestSuites -= 1;
    // TODO(debug): Does 'success' represent only failed tests?
    //  Or errored tests as well e.g.?
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
    log(`Processing ${results.numTotalTests} tests ..`);
    results.testResults // suite results
        .filter((testSuite) => testSuite.numFailingTests > 0)
        .forEach((testSuite) => {
            testSuite.testResults // individual test results
                .filter((testResult) => testResult.status === 'failed')
                .forEach((testResult) => {
                    processA11yErrors(testSuite, testResult);
                    modifyOriginalTestResult(results, testSuite, testResult);
                });
        });

    log(`Transforming a11y failures from ${consolidatedErrors.size} suites ..`);
    // Create test suites to hold a11y failures
    consolidatedErrors.forEach((testResults, suiteKey) => {
        // TODO (refactor): Do we need to create a test suite if suite name
        //  is not changing? Can this be simplified by adding tests to existing suite?
        const sa11ySuite = createEmptyTestResult();
        // "testFilePath" gets output as suite "name" in formatted JSON result
        sa11ySuite.testFilePath = suiteKey;
        sa11ySuite.testResults = testResults;
        sa11ySuite.numFailingTests = testResults.length;
        addResult(results, sa11ySuite);
    });

    return results;
}

// The processor must be a node module that exports a function
module.exports = resultsProcessor;
