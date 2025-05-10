/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { setup } from '../src';
import * as automatic from '../src/automatic';
import { registerSa11yAutomaticChecks } from '../src/automatic';
import * as Sa11yCommon from '@sa11y/common';
import { expect, jest } from '@jest/globals';

describe('automatic checks registration', () => {
    const prevEnv = process.env;
    afterAll(() => {
        jest.restoreAllMocks();
        process.env = prevEnv; // Restore prev env
    });

    beforeEach(() => {
        // Reset process.env Ref: https://stackoverflow.com/a/48042799
        jest.resetModules();
        process.env = { ...prevEnv }; // Copy prev env
    });

    const registerAutomaticMock = jest.spyOn(automatic, 'registerSa11yAutomaticChecks');

    it('should run when called directly without setup', () => {
        registerSa11yAutomaticChecks(); // exercising default args for code cov
        expect(registerAutomaticMock).toHaveBeenCalled();
    });

    it('should not run by default via setup', () => {
        setup();
        expect(registerAutomaticMock).toHaveBeenCalledWith(
            expect.objectContaining({
                runAfterEach: false,
                cleanupAfterEach: false,
                consolidateResults: false,
            })
        );
    });

    it('should run when opted in via setup', () => {
        setup({ autoCheckOpts: { runAfterEach: true } });
        expect(registerAutomaticMock).toHaveBeenCalledWith(
            expect.objectContaining({
                runAfterEach: true,
                cleanupAfterEach: false,
                consolidateResults: true,
            })
        );
    });

    it('should not run when opted out with env vars', () => {
        // TODO (debug): If this test is moved to after the next test it fails
        //  even with process.env cleanup after/before each test or jest.isolateModules()
        //  Use mocked-env pkg ?
        process.env.SA11Y_AUTO = '';
        process.env.SA11Y_CLEANUP = '';
        setup();
        process.env.SA11Y_ENABLE_DOM_MUTATION_OBSERVER = '';
        expect(registerAutomaticMock).toHaveBeenCalledWith(
            expect.objectContaining({
                runAfterEach: false,
                cleanupAfterEach: false,
                consolidateResults: false,
                runDOMMutationObserver: false,
            })
        );
    });

    it('should run when opted in with env vars', () => {
        process.env.SA11Y_AUTO = '1';
        setup();
        expect(registerAutomaticMock).toHaveBeenCalledWith(
            expect.objectContaining({
                runAfterEach: true,
                cleanupAfterEach: false,
                consolidateResults: true,
            })
        );

        process.env.SA11Y_CLEANUP = '1';
        setup();
        expect(registerAutomaticMock).toHaveBeenCalledWith(
            expect.objectContaining({
                runAfterEach: true,
                cleanupAfterEach: true,
                consolidateResults: true,
            })
        );
    });

    it('should set run only files option when specified', () => {
        const testFiles = 'foo,bar';
        process.env.SA11Y_AUTO_FILTER = testFiles;
        jest.spyOn(Sa11yCommon, 'useFilesToBeExempted').mockReturnValueOnce(['file1', 'file2']);
        setup();
        expect(registerAutomaticMock).toHaveBeenCalledWith(
            expect.objectContaining({
                // TODO (debug): Values seem to be carrying over from previous test
                //  in spite of env reset in setup/teardown. 'true' values below are 'false'
                //  when run in isolation with 'it.only'
                runAfterEach: true,
                cleanupAfterEach: true,
                consolidateResults: true,
                // filesFilter: ['foo', 'bar', 'file1', 'file2'],
            })
        );
    });
});
