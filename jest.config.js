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
            branches: 79,
            functions: 79,
            lines: 79,
            statements: 79,
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
    setupFilesAfterEnv: ['./jest.setup.js'],
};
