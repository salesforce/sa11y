/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { AggregatedResult } from '@jest/test-result/build/types';

/**
 * Custom results processor for a11y results. Only affects JSON results file output.
 * To be used with jest cli options --json --outputFile
 *  e.g. jest --json --outputFile jestResults.json --testResultsProcessor node_modules/@sa11y/jest/dist/resultsProcessor.js
 * Ref: https://jestjs.io/docs/configuration#testresultsprocessor-string
 */
export function resultsProcessor(results: AggregatedResult): AggregatedResult {
    results.testResults = results.testResults.filter((testSuite) => testSuite.numFailingTests > 0);

    results.testResults.forEach(
        (testSuite, index) =>
            (results.testResults[index].testResults = testSuite.testResults.filter(
                (testResult) => testResult.status === 'failed'
            ))
    );
    return results;
}

// The processor must be a node module that exports a function
module.exports = resultsProcessor;
