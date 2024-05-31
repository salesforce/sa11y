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
interface FailureMatcherDetail {
    error?: {
        matcherResult?: {
            a11yError?: A11yError;
        };
    };
}

type ErrorElement = {
    html: string;
    selectors: string;
    hierarchy: string;
    any: string;
    all: string;
    none: string;
};

type A11yViolation = {
    id: string;
    description: string;
    helpUrl: string;
    wcagCriteria: string;
    summary: string;
    errorElements: ErrorElement[];
};

const formatSpacing = '\t'.repeat(8);
const formatForAxeMessage = `\n${formatSpacing}\t\t`;

const axeMessages = {
    toSolveAny: `${formatForAxeMessage}- More Info: To solve the problem, you need to fix at least (1) of the following:\n`,
    toSolveFirst: `${formatForAxeMessage}- More Info: To solve the problem, you need to fix one of the following:\n`,
    toSolveSecond: `${formatForAxeMessage}- And fix the following:\n`,
};
/**
 * Create a test failure html elements array grouped by rule violation
 */
function createA11yErrorElements(errorElements: ErrorElement[]) {
    const a11yErrorElements: string[] = [];
    errorElements.forEach((errorElement, index) => {
        let errorMessage = `${formatSpacing}(${index + 1}) - HTML element : ${errorElement.html
            .replace(/&lt;/g, '<')
            .replace(/&gt;/, '>')}
                    - CSS selector(s) : ${errorElement.selectors.replace(/&gt;/, '>')}
                    - HTML Tag Hierarchy : ${errorElement.hierarchy}`;

        if (errorElement.any && errorElement.any.length > 0) {
            errorMessage += `${axeMessages.toSolveAny}${errorElement.any}`;
            if (errorElement.all && errorElement.all.length > 0) {
                errorMessage += `${axeMessages.toSolveSecond}${errorElement.all}`;
            }
            if (errorElement.none && errorElement.none.length > 0) {
                errorMessage += `${axeMessages.toSolveSecond}${errorElement.none}`;
            }
        } else if (errorElement.all && errorElement.all.length > 0) {
            errorMessage += `${axeMessages.toSolveFirst}${errorElement.all}`;
            if (errorElement.none && errorElement.none.length > 0) {
                errorMessage += `${axeMessages.toSolveSecond}${errorElement.none}`;
            }
        } else {
            if (errorElement.none && errorElement.none.length > 0) {
                errorMessage += `${axeMessages.toSolveFirst}${errorElement.none}`;
            }
        }
        a11yErrorElements.push(errorMessage);
    });

    return a11yErrorElements.join('\n');
}

/**
 * Create a test failure violation error message grouped by rule violation
 */
function createA11yRuleViolation(a11yRule: A11yViolation, ruleIndex: number) {
    return `(${ruleIndex}) [${a11yRule.id}] ${a11yRule.description}
            * Error element(s) : ${a11yRule.errorElements.length}\n${createA11yErrorElements(a11yRule.errorElements)}
            * Help:
                - Help URL: ${a11yRule.helpUrl}
                - WCAG Criteria: ${a11yRule.wcagCriteria}`;
}

/**
 * Create a test processA11yDetailsAndMessages violation error message grouped by rule violation
 */
function processA11yDetailsAndMessages(error: A11yError, a11yFailureMessages: string[]) {
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
            hierarchy: a11yResult.ancestry,
            any: a11yResult.any,
            all: a11yResult.all,
            none: a11yResult.none,
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
    For technical questions regarding Salesforce accessibility tools, contact our Sa11y team: http://sfdc.co/sa11y-users
    For guidance on accessibility related specifics, contact our A11y team: http://sfdc.co/tmp-a11y
    `;
    a11yFailureMessages.push(a11yFailureMessage);
}

/**
 * Create a test processA11yDetailsAndMessages violation error message grouped by rule violation
 */
function processA11yDetailsAndMessages(error: A11yError, a11yFailureMessages: string[]) {
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
            hierarchy: a11yResult.ancestry,
            any: a11yResult.any,
            all: a11yResult.all,
            none: a11yResult.none,
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
    For technical questions regarding Salesforce accessibility tools, contact our Sa11y team: http://sfdc.co/sa11y-users
    For guidance on accessibility related specifics, contact our A11y team: http://sfdc.co/tmp-a11y
    `;
    a11yFailureMessages.push(a11yFailureMessage);
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
