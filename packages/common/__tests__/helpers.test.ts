/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { useFilesToBeExempted, log } from '@sa11y/common'; // Replace 'yourFileName' with the actual file path
import { execSync } from 'child_process';

jest.mock('child_process', () => ({
    execSync: jest.fn(() => {
        throw new Error('this is throw');
    }),
}));

describe('Your Module', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should log messages when SA11Y_DEBUG is set', () => {
        const originalEnv = process.env.SA11Y_DEBUG;
        process.env.SA11Y_DEBUG = 'true';

        const consoleSpy = jest.spyOn(console, 'log');
        log('Test Log Message');

        expect(consoleSpy).toHaveBeenCalledWith('♿[Sa11y]', 'Test Log Message');

        process.env.SA11Y_DEBUG = originalEnv; // Restore original environment variable
    });

    it('should return an empty array if packageName is not set', () => {
        const result = useFilesToBeExempted();

        expect(result).toEqual([]);
    });

    it('should return an empty array if SA11Y_AUTO_FILTER_LIST_PACKAGE_REQUIREMENT is not set', () => {
        process.env.SA11Y_AUTO_FILTER_LIST_PACKAGE_NAME = 'somePackage';
        process.env.SA11Y_AUTO_FILTER_LIST_PACKAGE_REQUIREMENT = '';

        const result: string[] = useFilesToBeExempted();

        expect(result).toEqual([]);

        // Cleanup
        delete process.env.SA11Y_AUTO_FILTER_LIST_PACKAGE_REQUIREMENT;
        delete process.env.SA11Y_AUTO_FILTER_LIST_PACKAGE_NAME;
    });
});
