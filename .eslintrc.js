/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        // Specify a tsconfig specifically for eslint with simple glob patterns without project references
        // as @typescript-eslint does not support project references:
        // https://github.com/typescript-eslint/typescript-eslint/issues/2094
        // Without this checking individual files with lint-staged fails:
        // https://github.com/typescript-eslint/typescript-eslint/issues/967#issuecomment-531817014
        tsconfigRootDir: __dirname,
        project: './tsconfig.eslint.json',
    },
    plugins: [
        '@typescript-eslint',
        'tsdoc',
        'jest',
        'prettier',
        'notice', // checks for and fixes copyright header in each file
        'markdown',
    ],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        // TODO (fix): Enabling this results in 80+ errors with new versions of @typescript-eslint and typescript v4. Enable and fix the errors
        // 'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:jest/recommended',
        'plugin:jest/style',
        'plugin:prettier/recommended',
        'prettier/@typescript-eslint',
        'plugin:import/typescript',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:eslint-comments/recommended',
        'plugin:markdown/recommended',
    ],
    settings: {
        'import/resolver': {
            // Makes plugin:import work with Typescript interfaces etc
            typescript: {
                alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code
            },
        },
    },
    rules: {
        'notice/notice': [
            'error',
            {
                templateFile: 'license-header.txt',
            },
        ],
        'tsdoc/syntax': 'warn',
    },
    overrides: [
        {
            // Enable the Markdown processor for all .md files.
            files: ['**/*.md'],
            processor: 'markdown/markdown',
        },
    ],
    env: {
        browser: true,
        node: true,
    },
    ignorePatterns: ['node_modules', 'dist', 'coverage'],
};
