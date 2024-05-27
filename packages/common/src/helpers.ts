/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * Convenience wrapper to prefix a standard header for console log messages.
 * Logging is enabled only when environment variable `SA11Y_DEBUG` is set.
 */
const sa11yAutoFilterListDefaultPackageName = 'sa11y-jest-automated-check-file-exclusion';

import * as fs from 'fs';
import path from 'path';
export function log(...args: unknown[]): void {
    // Probably not worth it to mock and test console logging for this helper util
    /* istanbul ignore next */
    if (process.env.SA11Y_DEBUG) console.log('♿[Sa11y]', ...args);
}

export function useFilesToBeExempted(): string[] {
    const packageName: string =
        process.env.SA11Y_AUTO_FILTER_LIST_PACKAGE_NAME ?? sa11yAutoFilterListDefaultPackageName;
    let getFilesToBeExempted: () => string[];
    if (packageName !== '') {
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            getFilesToBeExempted = require(packageName) as () => string[];
            const filesToBeExempted = getFilesToBeExempted();
            return filesToBeExempted;
        } catch (error) {
            if (packageName !== sa11yAutoFilterListDefaultPackageName) console.log('Package not found : ', packageName);
        }
    }
    return [];
}

export function useCustomRules(): string[] {
    const filePath = process.env.SA11Y_CUSTOM_RULES ?? '';
    if (filePath !== '') {
        try {
            // Read the file asynchronously
            const data = fs.readFileSync(filePath, 'utf-8');
            const { rules } = JSON.parse(data) as { rules: string[] };
            // Access the rules array
            return rules;
        } catch (err) {
            console.error('Error reading the custom ruleset file:', err);
        }
    }
    return [];
}

// Function to process files in a directory and push their content to a target array
export const processFiles = <T>(
    dir: string,
    targetArray: T[],
    extension: string,
    parser: (data: string) => T
): void => {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
        if (path.extname(file) === extension) {
            const filePath = path.join(dir, file);
            const fileData = parser(fs.readFileSync(filePath, 'utf8'));
            targetArray.push(fileData);
        }
    });
};
