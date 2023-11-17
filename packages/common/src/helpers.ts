// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
import { execSync } from 'child_process';

export function log(...args: unknown[]): void {
    // Probably not worth it to mock and test console logging for this helper util
    /* istanbul ignore next */
    if (process.env.SA11Y_DEBUG) console.log('♿[Sa11y]', ...args);
}

export function useFilesToBeExempted(): string[] {
    const packageName: string = process.env.SA11Y_AUTO_FILTER_LIST_PACKAGE_NAME || '';

    const installPackageIfNeeded = (packageName: string): number => {
        const installCommand = `npm install ${packageName}`;

        console.log(`Downloading package: ${packageName}`);
        try {
            execSync(installCommand, { stdio: 'inherit' });
            return 1;
        } catch (error) {
            return 0;
        }
    };

    if (packageName != '') {
        let getFilesToBeExempted: () => any[]; // Declare the function outside the try block scope
        try {
            getFilesToBeExempted = require(packageName);
            const filesToBeExempted: string[] = getFilesToBeExempted();
            return filesToBeExempted;
        } catch (error) {
            if (process.env.SA11Y_AUTO_FILTER_LIST_PACKAGE_REQUIREMENT != '') {
                const status = installPackageIfNeeded(packageName);
                if (status == 1) {
                    getFilesToBeExempted = require(packageName);
                    const filesToBeExempted: string[] = getFilesToBeExempted();
                    return filesToBeExempted;
                }
            }
        }
    }
    return [];
}
