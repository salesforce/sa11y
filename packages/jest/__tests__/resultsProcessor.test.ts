/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { aggregatedTestResults, domWithA11yIssues } from '@sa11y/test-utils';
import resultsProcessor from '../src/resultsProcessor';
import { automaticCheck } from '../src/automatic';
import { addResult, createEmptyTestResult, makeEmptyAggregatedTestResult } from '@jest/test-result';
import { AssertionResult } from '@jest/test-result/build/types';
import { A11yError } from '@sa11y/format';

// Note: To re-generate test data when required (e.g. changes in A11yError)
//  enable the following tests and the code to output file in resultsProcessor.ts
/* eslint-disable jest/no-commented-out-tests,jest/expect-expect */
// eslint-disable-next-line jest/no-disabled-tests
describe.skip('Prepare test data (when A11yError changes)', () => {
    it('with a11y failures', async () => {
        document.body.innerHTML = domWithA11yIssues;
        await automaticCheck({ cleanupAfterEach: false });
    });

    it('with duplicate a11y failures to test consolidation', async () => {
        document.body.innerHTML = domWithA11yIssues;
        await automaticCheck({ cleanupAfterEach: false });
    });

    it('with non-a11y failures', () => {
        expect(1).toBe(2);
    });
});
/* eslint-enable jest/no-commented-out-tests,jest/expect-expect */

describe('Results Processor', () => {
    it.skip('should prepare test data', () => {
        // TODO (refactor): Generate test results using helpers instead of hard-coded result file.
        //  The helpers seem to have functions to generate only empty test results.
        //  Not able to find one which can take an Error() and convert it into a test result (AssertionResult).
        const aggregatedResults = makeEmptyAggregatedTestResult();
        const testSuite = createEmptyTestResult();
        const testResult = { failureDetails: [new A11yError([])], status: 'failed' } as AssertionResult;
        testSuite.testResults.push(testResult);
        testSuite.numFailingTests += 1;
        addResult(aggregatedResults, testSuite);
        expect(resultsProcessor(aggregatedTestResults)).toMatchSnapshot();
    });

    it('should have valid test data to start with', () => {
        expect(aggregatedTestResults.numFailedTests).toBeGreaterThan(0);
    });

    it('should process test results as expected', () => {
        // TODO (tests): Add more fine grained, targeted tests
        expect(resultsProcessor(aggregatedTestResults)).toMatchSnapshot();
        // expect(resultsProcessor(aggregatedTestResults)).not.toStrictEqual(aggregatedTestResults);
    });
});
