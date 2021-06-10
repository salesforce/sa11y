/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import resultsProcessor from '../src/resultsProcessor';
import { addResult, createEmptyTestResult, makeEmptyAggregatedTestResult } from '@jest/test-result';
import { AggregatedResult, AssertionResult, TestResult } from '@jest/test-result/build/types';
import { A11yError, A11yResult } from '@sa11y/format';
import { getViolations } from '@sa11y/format/__tests__/format.test';
import { domWithVisualA11yIssues } from '@sa11y/test-utils';

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
    const violations = await getViolations();
    const violationsVisual = await getViolations(domWithVisualA11yIssues);
    const combinedViolations = [...violations, ...violationsVisual];
    a11yResults.push(...A11yResult.convert(combinedViolations));
    addTestFailure(testSuite, new A11yError(violations));
    addTestFailure(testSuite, new A11yError(violationsVisual));
    // Duplicate test result to test consolidation
    addTestFailure(testSuite, new A11yError(violations));
    addTestFailure(testSuite, new A11yError(violationsVisual));
    addTestFailure(testSuite, new A11yError(combinedViolations));
    // Add non-a11y test failure
    addTestFailure(testSuite, new Error('foo'));
    testSuite.testFilePath = '/test/data/sa11y-auto-checks.js';
    addResult(aggregatedResults, testSuite);
});

describe('Results Processor', () => {
    it('should have valid test data to start with', () => {
        expect(aggregatedResults.numFailedTestSuites).toBe(1);
        expect(aggregatedResults.numFailedTests).toBe(numTestFailures);
        expect(aggregatedResults).toMatchSnapshot();
    });

    it('should process test results as expected', () => {
        // Create a copy as results gets mutated by results processor
        const results = JSON.parse(JSON.stringify(aggregatedResults)) as AggregatedResult;
        const processedResults = resultsProcessor(results);
        expect(processedResults).toMatchSnapshot();
        expect(processedResults).not.toEqual(aggregatedResults);
        // Should have added one more test suite for a11y errors
        expect(processedResults.numFailedTestSuites).toBeGreaterThan(aggregatedResults.numFailedTestSuites + 1);
        expect(processedResults.numTotalTests).toEqual(aggregatedResults.numTotalTests + a11yResults.length - 1); // After consolidation + non-a11y failure
    });
});
