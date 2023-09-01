/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { AggregatedResult, AssertionResult, TestResult } from '@jest/test-result';
import { log } from '@sa11y/common';
import { A11yError } from '@sa11y/format';

type FailureDetail = {
    error?: A11yError;
};

type ErrorElement = {
    html: string;
    selectors: string;
    hierarchy: string;
};

type A11yViolation = {
    id: string;
    description: string;
    helpUrl: string;
    wcagCriteria: string;
    summary: string;
    errorElements: ErrorElement[];
};

/**
 * Create a test failure html elements array grouped by rule violation
 */
function createA11yErrorElements(errorElements: ErrorElement[]) {
    const a11yErrorElements: string[] = [];
    errorElements.forEach((errorElement, index) => {
        a11yErrorElements.push(
            `- (${index + 1}) HTML element : ${errorElement.html.replace(/&lt;/g, '<').replace(/&gt;/, '>')}
             - CSS selector(s) : ${errorElement.selectors.replace(/&gt;/, '>')}
             - HTML Tag Hierarchy : ${errorElement.hierarchy}`
        );
    });

    return a11yErrorElements.join('\n');
}

/**
 * Create a test failure violation error message grouped by rule violation
 */
function createA11yRuleViolation(a11yRule: A11yViolation, ruleIndex: number) {
    return `(${ruleIndex}) [${a11yRule.id}] ${a11yRule.description}
            * Help URL: ${a11yRule.helpUrl}
            * WCAG Criteria: ${a11yRule.wcagCriteria}
            * More info: ${a11yRule.summary}
            * Error element(s) : ${a11yRule.errorElements.length}
            ${createA11yErrorElements(a11yRule.errorElements)}`;
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
            const a11yRuleViolations: { [key: string]: A11yViolation } = {};
            let a11yRuleViolationsCount = 0;
            let a11yErrorElementsCount = 0;
            error.a11yResults.forEach((a11yResult) => {
                a11yErrorElementsCount++;
                if (!(a11yRuleViolations as never)[a11yResult.wcag]) {
                    a11yRuleViolationsCount++;
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    a11yRuleViolations[a11yResult.wcag] = {
                        id: a11yResult.id,
                        description: a11yResult.description,
                        helpUrl: a11yResult.helpUrl,
                        wcagCriteria: a11yResult.wcag,
                        summary: a11yResult.summary,
                        errorElements: [],
                    };
                }
                a11yRuleViolations[a11yResult.wcag].errorElements.push({
                    html: a11yResult.html,
                    selectors: a11yResult.selectors,
                    hierarchy: a11yResult.key,
                });
            });

            const a11yFailureMessage = `
            The test has failed the accessibility check. Accessibility Stacktrace/Issues:
            ${a11yErrorElementsCount} HTML elements have accessibility issue(s). ${a11yRuleViolationsCount} rules failed.

            ${Object.values(a11yRuleViolations)
                .map((a11yRuleViolation, index) => createA11yRuleViolation(a11yRuleViolation, index + 1))
                .join('\n')}
            For more info about automated accessibility testing: https://sfdc.co/a11y-test
            For tips on fixing accessibility bugs: https://sfdc.co/a11y
            Questions? Post on Accessibility Team Chatter: https://sfdc.co/a11y-gus
            `;
            a11yFailureMessages.push(a11yFailureMessage);
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

/**
 * Custom results processor for a11y results grouping the violations. Only affects JSON results file output.
 * To be used with jest cli options --json --outputFile
 *  e.g. jest --json --outputFile jestResults.json --testResultsProcessor `node_modules/@sa11y/jest/dist/groupViolationResultsProcessor.js`
 * Ref: https://jestjs.io/docs/configuration#testresultsprocessor-string
 *  - Mapping of AggregatedResult to JSON format to https://github.com/facebook/jest/blob/master/packages/jest-test-result/src/formatTestResults.ts
 */
export default function resultsProcessor(results: AggregatedResult): AggregatedResult {
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

// The processor must be a node module that exports a function
module.exports = resultsProcessor;
