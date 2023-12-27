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

export function log(...args: unknown[]): void {
    // Probably not worth it to mock and test console logging for this helper util
    /* istanbul ignore next */
    if (process.env.SA11Y_DEBUG) console.log('♿[Sa11y]', ...args);
}

export function useFilesToBeExempted(): string[] {
    const packageName: string =
        process.env.SA11Y_AUTO_FILTER_LIST_PACKAGE_NAME ?? 'sa11y-jest-automated-check-file-exclusion';
    let getFilesToBeExempted: () => string[];
    if (packageName !== '') {
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            getFilesToBeExempted = require(packageName) as () => string[];
            const filesToBeExempted = getFilesToBeExempted();
            return filesToBeExempted;
        } catch (error) {
            console.log('Package not found : ', packageName);
        }
    }
    return [];
}
