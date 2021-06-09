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
import { AxeResults } from '@sa11y/common';
import { getViolations } from '@sa11y/format/__tests__/format.test';

const violations: AxeResults = [];
const a11yResults: A11yResult[] = [];
const aggregatedResults = makeEmptyAggregatedTestResult();
const testSuite = createEmptyTestResult();
let testSuffix = 0;

function addTestFailure(suite: TestResult, err: Error) {
    const failure = {
        // Subset of props used by results processor logic
        failureDetails: [err],
        fullName: `${err.name}-${testSuffix}`, // Unique test name to test consolidation
        status: 'failed',
        ancestorTitles: ['sa11y'],
    } as AssertionResult;
    suite.testResults.push(failure);
    suite.numFailingTests += 1;
    testSuffix++;
}

beforeAll(async () => {
    // Prepare test data
    violations.push(...(await getViolations()));
    a11yResults.push(...A11yResult.convert(violations));
    addTestFailure(testSuite, new A11yError(violations));
    // Duplicate test result to test consolidation
    addTestFailure(testSuite, new A11yError(violations));
    // Add non-a11y test failure
    addTestFailure(testSuite, new Error('foo'));
    testSuite.testFilePath = '/test/data/sa11y-auto-checks.js';
    addResult(aggregatedResults, testSuite);
});

describe('Results Processor', () => {
    it('should have valid test data to start with', () => {
        expect(aggregatedResults.numFailedTests).toBe(3);
        expect(aggregatedResults.numFailedTestSuites).toBe(1);
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
        expect(processedResults.numTotalTests).toEqual(aggregatedResults.numTotalTests + 2 * a11yResults.length); // Before consolidation
    });
});
