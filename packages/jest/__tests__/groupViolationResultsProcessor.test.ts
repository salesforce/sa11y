/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import groupViolationResultsProcessor from '../src/groupViolationResultsProcessor';
import { addResult, createEmptyTestResult, makeEmptyAggregatedTestResult } from '@jest/test-result';
import { AggregatedResult, AssertionResult, TestResult } from '@jest/test-result/build/types';
import { A11yError, A11yResult } from '@sa11y/format';
import { getA11yError } from '@sa11y/format/__tests__/format.test';
import { domWithVisualA11yIssues } from '@sa11y/test-utils';
import { expect } from '@jest/globals';

const a11yResults: A11yResult[] = [];
const aggregatedResults = makeEmptyAggregatedTestResult();
const testSuite = createEmptyTestResult();
let numTestFailures = 0;

function addTestFailure(suite: TestResult, err: Error) {
    const failure = {
        // Subset of props used by results processor logic
        failureDetails: [err],
        fullName: `${err.name}-${numTestFailures}`, // Unique test name to test consolidation
        status: 'failed',
        ancestorTitles: ['sa11y'],
    } as AssertionResult;
    suite.testResults.push(failure);
    suite.numFailingTests += 1;
    numTestFailures++;
}

beforeAll(async () => {
    // Prepare test data
    const a11yError = await getA11yError();
    const a11yErrorVisual = await getA11yError(domWithVisualA11yIssues);
    const combinedViolations = [...a11yError.violations, ...a11yErrorVisual.violations];
    a11yResults.push(...a11yError.a11yResults, ...a11yErrorVisual.a11yResults);
    addTestFailure(testSuite, new A11yError(a11yError.violations, a11yError.a11yResults));
    addTestFailure(testSuite, new A11yError(a11yErrorVisual.violations, a11yErrorVisual.a11yResults));
    // Duplicate test result to test consolidation
    addTestFailure(testSuite, new A11yError(a11yError.violations, a11yError.a11yResults));
    addTestFailure(testSuite, new A11yError(a11yErrorVisual.violations, a11yErrorVisual.a11yResults));
    addTestFailure(testSuite, new A11yError(combinedViolations, a11yResults));
    // Add non-a11y test failure
    addTestFailure(testSuite, new Error('foo'));
    testSuite.testFilePath = '/test/data/sa11y-auto-checks.js';
    addResult(aggregatedResults, testSuite);
});

describe('Group Violation Results Processor', () => {
    it('should process test results as expected', () => {
        // Create a copy as results gets mutated by results processor
        const results = JSON.parse(JSON.stringify(aggregatedResults)) as AggregatedResult;
        const processedResults = groupViolationResultsProcessor(results);
        expect(processedResults).toMatchSnapshot();
        expect(processedResults).not.toEqual(aggregatedResults);
        expect(processedResults.numFailedTestSuites).toBe(1);
    });
});
