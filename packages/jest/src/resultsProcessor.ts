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
import { AxeResults, errMsgHeader } from '@sa11y/common';

type FailureDetail = {
    error?: A11yError;
};

type WcagLevel = 'A' | 'AA' | 'AAA' | undefined;
type WcagVersion = '2.0' | '2.1' | undefined;
/**
 * Process given tags from a11y violations and return WCAG meta-data
 * Ref: https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#axe-core-tags
 */
class WcagMetadata {
    static readonly regExp = /^(wcag)(?<version_or_sc>\d+)(?<level>a*)$/;
    public wcagLevel: WcagLevel;
    public wcagVersion: WcagVersion;
    public successCriteria = 'best-practice'; // Default SC for non-wcag rules
    constructor(readonly tags: string[]) {
        tags.forEach((tag) => {
            const match = WcagMetadata.regExp.exec(tag);
            if (match && match.groups) {
                const level = match.groups.level;
                // Tags starting with "wcag" can contain either wcag version and level
                // or success criteria
                if (level) {
                    this.wcagLevel = level.toUpperCase() as WcagLevel;
                    if (match.groups.version_or_sc === '2') {
                        this.wcagVersion = '2.0'; // Add decimal for consistency
                    } else {
                        this.wcagVersion = match.groups.version_or_sc.split('').join('.') as WcagVersion;
                    }
                } else {
                    this.successCriteria = match.groups.version_or_sc.split('').join('.');
                }
            }
        });
    }

    /**
     * Return formatted string containing WCAG version, level and SC
     */
    toString(): string {
        if (!this.wcagVersion || !this.wcagLevel) {
            throw new Error(`Unable to set WCAG version and level from given tags: ${this.tags.join(', ')}`);
        }
        return `WCAG-${this.wcagVersion}-Level-${this.wcagLevel} SC-${this.successCriteria}`;
    }
}

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
