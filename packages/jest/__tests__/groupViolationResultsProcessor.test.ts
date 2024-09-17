/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { addResult, createEmptyTestResult, makeEmptyAggregatedTestResult } from '@jest/test-result';
import { AggregatedResult, AssertionResult, TestResult } from '@jest/test-result/build/types';
import { A11yError, A11yResult } from '@sa11y/format';
import { getA11yError } from '@sa11y/format/__tests__/format.test';
import { domWithVisualA11yIssues } from '@sa11y/test-utils';
import { expect } from '@jest/globals';
import {
    resultsProcessor,
    resultsProcessorManualChecks,
    ErrorElement,
    createA11yErrorElements,
} from '../src/groupViolationResultsProcessor';

const a11yResults: A11yResult[] = [];
const aggregatedResults = makeEmptyAggregatedTestResult();
const testSuite = createEmptyTestResult();
let numTestFailures = 0;

function addTestFailure(suite: TestResult, err: Error, isMatcher = false) {
    if (!err) {
        throw new Error('Error object is required');
    }

    let failure: AssertionResult;
    if (isMatcher) {
        failure = {
            failureDetails: [
                {
                    error: {
                        matcherResult: {
                            a11yError: err,
                        },
                    },
                },
            ],
            fullName: `${err.name}#${numTestFailures}`, // Unique test name to test consolidation
            status: 'failed',
            ancestorTitles: ['sa11y'],
        };
    } else {
        failure = {
            failureDetails: [err],
            fullName: `${err.name}@${numTestFailures}`, // Unique test name to test consolidation
            status: 'failed',
            ancestorTitles: ['sa11y'],
        };
    }

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
    addTestFailure(testSuite, new A11yError(a11yError.violations, a11yError.a11yResults), true);
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
        const resultsForMatcher = results;
        const processedResultsManual = resultsProcessorManualChecks(resultsForMatcher);
        expect(processedResultsManual).toMatchSnapshot();

        const processedResults = resultsProcessor(results);
        expect(processedResults).toMatchSnapshot();
        expect(processedResults).not.toEqual(aggregatedResults);
        expect(processedResults.numFailedTestSuites).toBe(1);
    });

    it('should process error Elements as expected', () => {
        const errorElements: ErrorElement[] = [
            {
                html: '<div role="button" tabindex="0">Click me</div>',
                selectors: '.button',
                hierarchy: 'body > div.button',
                any: 'role button is interactive',
                all: 'element should be focusable and have a click handler',
                none: 'no color contrast issues',
                relatedNodeAny: 'none',
                relatedNodeAll: 'none',
                relatedNodeNone: 'none',
                message: 'Ensure the element has a valid interactive role and behavior.',
            },
            {
                html: '<img src="image.jpg" alt="">',
                selectors: 'img',
                hierarchy: 'body > img',
                all: 'image elements must have an alt attribute',
                none: 'no missing alt attribute allowed',
                relatedNodeAny: 'none',
                relatedNodeAll: 'none',
                relatedNodeNone: 'none',
                message: 'Add an appropriate alt attribute describing the image.',
                any: '',
            },
        ];

        const createdA11yErrorElements = createA11yErrorElements(errorElements);
        expect(createdA11yErrorElements).toMatchSnapshot();
    });
});
