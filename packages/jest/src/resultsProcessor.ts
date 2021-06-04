/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { buildFailureTestResult } from '@jest/test-result';
import { AggregatedResult, AssertionResult, SerializableError, TestResult } from '@jest/test-result/build/types';
import { AxeResults, errMsgHeader } from '@sa11y/common';
import { A11yError, WcagMetadata } from '@sa11y/format';

type FailureDetail = {
    error?: A11yError;
};

// Map of test suite name to test results
const consolidatedErrors = new Map<string, AssertionResult[]>();

/**
 * Modify existing test suites, test results containing a11y errors after a11y errors
 *  are extracted out into their own test suites and results
 */
function modifyTestSuiteResults(testSuite: TestResult, testResult: AssertionResult) {
    // Don't report the failure twice
    testResult.status = 'disabled';
    // Suites with only a11y errors should be marked as passed
    testSuite.numFailingTests -= 1;
    // TODO (fix): Remove sa11y msg from test suite message
    //  ANSI codes and test names in suite message makes it difficult
    // testResult.failureMessages = [];
    // testResult.failureDetails = [];
    // testSuite.failureMessage = '';
}

/**
 * Convert a11y violations from given Jest tests to A11y Test Results
 */
function convertA11yTestResult(testSuite: TestResult, testResult: AssertionResult, violations: AxeResults) {
    const suiteName = testSuite.testFilePath.substring(testSuite.testFilePath.lastIndexOf('/') + 1);

    modifyTestSuiteResults(testSuite, testResult);

    violations.forEach((violation) => {
        const wcagMetaData = new WcagMetadata(violation.tags).toString();
        violation.nodes.forEach((a11yError) => {
            // TODO (refactor): Extract common code and reuse in regular a11y formatted error output
            const suiteKey = `[Sa11y ${wcagMetaData} ${violation.id}]: ${suiteName}`;
            if (!consolidatedErrors.has(suiteKey)) consolidatedErrors.set(suiteKey, []);
            consolidatedErrors.get(suiteKey)?.push({
                ...testResult,
                fullName: `${a11yError.target[0]}`, // First CSS Selector
                failureMessages: [
                    `${errMsgHeader}: ${violation.help}
 CSS Selectors: "${a11yError.target.join('; ')}"
 Help: ${violation.helpUrl.split('?')[0]}
 Tests: "${testResult.fullName}"`,
                ],
                failureDetails: [], // We don't need them anymore
                ancestorTitles: [...new Set(testResult.ancestorTitles).add(testResult.fullName)], // Add all test's having the same a11y issue
            } as AssertionResult);
        });
    });
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
            convertA11yTestResult(testSuite, testResult, error.violations);
        }
    });
}

/**
 * Custom results processor for a11y results. Only affects JSON results file output.
 * To be used with jest cli options --json --outputFile
 *  e.g. jest --json --outputFile jestResults.json --testResultsProcessor node_modules/@sa11y/jest/dist/resultsProcessor.js
 * Ref: https://jestjs.io/docs/configuration#testresultsprocessor-string
 *  - Mapping of AggregatedResult to JSON format to https://github.com/facebook/jest/blob/master/packages/jest-test-result/src/formatTestResults.ts
 */
export default function resultsProcessor(results: AggregatedResult): AggregatedResult {
    // Note: To re-generate test data when required (e.g. changes in A11yError)
    //  uncomment the following lines to write output to file and run:
    //  yarn jest --json --outputFile /tmp/jestOut.json --testResultsProcessor `pwd`/node_modules/@sa11y/jest/dist/resultsProcessor.js resultsProcessor.test.ts
    //
    // writeFileSync('/tmp/AggregatedResult.json', JSON.stringify(results, null, 2));
    // return results;

    // TODO (refactor): Use map/filter to get results directly without global var
    results.testResults // suite results
        .filter((testSuite) => testSuite.numFailingTests > 0)
        .forEach((testSuite) => {
            testSuite.testResults // individual test results
                .filter((testResult) => testResult.status === 'failed')
                .forEach((testResult) => processA11yErrors(testSuite, testResult));
        });

    consolidatedErrors.forEach((testResults, suiteKey) => {
        const sa11ySuite = buildFailureTestResult(suiteKey, new Error() as SerializableError);
        sa11ySuite.testResults = testResults;
        results.testResults.push(sa11ySuite);
    });

    return results;
}

// The processor must be a node module that exports a function
module.exports = resultsProcessor;
