/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { AggregatedResult, AssertionResult, SerializableError } from '@jest/test-result/build/types';
import { TestResult } from '@jest/reporters';
import { A11yError } from '@sa11y/format';
import { buildFailureTestResult } from '@jest/test-result';

type FailureDetail = {
    error?: A11yError;
};

// Map of test suite name to test results
const consolidatedErrors = new Map<string, AssertionResult[]>();

// suite.name = [Sa11y WCAG-`2.0`-Level-`A` SC-`1.1.1` `image-alt`]: `testSuite.testFilePath`
// test.name = CSS Selectors[0]
// test.failure.message =
//  first line: Accessibility issue found:`description`
//  rest: Help URL, CSS Selectors, List of tests `test.name`, Sa11y Help URL

function addTestResult(testResult: AssertionResult, testSuite: TestResult) {
    // const sa11yResults = [] as TestResult[];
    // Copy test suite meta-data and clear test results
    // const sa11yTestSuite = { ...testSuite, testResults: [] };
    const suiteName = testSuite.testFilePath.substring(testSuite.testFilePath.lastIndexOf('/') + 1);
    testResult.failureDetails.forEach((failure) => {
        let error = (failure as FailureDetail).error;
        // If using circus test runner https://github.com/facebook/jest/issues/11405#issuecomment-843549606
        if (error === undefined) error = failure as A11yError;
        if (error.name === A11yError.name) {
            // TODO : What happens if ever there are multiple failureDetails? Are there ever?
            error.violations.forEach((violation) => {
                violation.nodes.forEach((a11yError) => {
                    const suiteKey = `[Sa11y ${violation.id}]: ${suiteName}`;
                    if (!consolidatedErrors.has(suiteKey)) consolidatedErrors.set(suiteKey, []);
                    consolidatedErrors.get(suiteKey)?.push({
                        ...testResult,
                        fullName: `${a11yError.target[0]}`, // CSS Selector
                        failureMessages: [
                            `Accessibility issue found: ${violation.help}
 Help: ${violation.helpUrl.split('?')[0]}
 CSS Selectors: "${a11yError.target.join('; ')}"
 Tests: "${testResult.fullName}"
 More info: https://sfdc.co/a11y-jest`,
                        ],
                    });
                });
            });
            // Don't report the failure twice
            testResult.status = 'disabled';
            // Suites with only a11y errors should be marked as passed
            testSuite.numFailingTests -= 1;
            // TODO (fix): Remove sa11y msg from test suite message
            //  ANSI codes and test names in suite message makes it difficult
            // testResult.failureMessages = [];
            // testResult.failureDetails = [];
            testSuite.failureMessage = '';
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
    // const sa11yResults = [] as TestResult[];

    results.testResults // suite results
        .filter((testSuite) => testSuite.numFailingTests > 0)
        .forEach((testSuite) => {
            // Copy test suite meta-data and clear test results
            // const sa11yTestSuite = { ...testSuite, testResults: [] };

            testSuite.testResults // individual test results
                .filter((testResult) => testResult.status === 'failed')
                .forEach((testResult) => addTestResult(testResult, testSuite));

            // if (sa11yTestSuite.testResults.length > 0) {
            //     sa11yResults.push(sa11yTestSuite);
            // }
        });

    // results.testResults.push(...sa11yResults);

    consolidatedErrors.forEach((testResults, suiteKey) => {
        const sa11ySuite = buildFailureTestResult(suiteKey, new Error() as SerializableError);
        sa11ySuite.testResults = testResults;
        results.testResults.push(sa11ySuite);
    });

    return results;
}

// The processor must be a node module that exports a function
module.exports = resultsProcessor;
