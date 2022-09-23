/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },
    testEnvironment: 'jsdom',
    testRunner: 'jest-jasmine2',
    testMatch: ['**/__tests__/**/*.[jt]s?(x)'],
    // Custom results processor for a11y results. Only affects JSON results file output.
    // To be used with jest cli options --json --outputFile
    //   *  e.g. jest --json --outputFile jestResults.json
    // Ref: https://jestjs.io/docs/configuration#testresultsprocessor-string
    testResultsProcessor: '<rootDir>/packages/jest/dist/resultsProcessor.js',
};
