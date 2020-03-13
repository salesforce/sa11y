module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json', './packages/**/tsconfig.json'],
    },
    plugins: [
        '@typescript-eslint',
        'jest',
        'prettier',
        'notice', // checks for and fixes copyright header in each file
    ],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:jest/recommended',
        'plugin:jest/style',
        'plugin:prettier/recommended',
        'prettier/@typescript-eslint',
    ],
    rules: {
        'notice/notice': [
            'error',
            {
                templateFile: 'license-header.txt',
            },
        ],
    },
    env: {
        browser: true,
        node: true,
    },
    ignorePatterns: ['node_modules', 'dist', 'coverage'],
};
