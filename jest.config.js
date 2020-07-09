/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

const browserLibTestPath = '<rootDir>/packages/browser-lib';
const integrationTestPath = '<rootDir>/packages/test-integration';
const wdioTestPath = '<rootDir>/packages/wdio';

module.exports = {
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },
    // Exclude integration tests from being run with config as it has its own config and setup
    testPathIgnorePatterns: [browserLibTestPath, integrationTestPath, wdioTestPath],
    // Direct Jest to read the jest config file from integration tests
    projects: ['<rootDir>', integrationTestPath],
};
