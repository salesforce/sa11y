/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { setup } from '../src';
import * as automatic from '../src/automatic';
import { automaticCheck, registerSa11yAutomaticChecks, skipTest } from '../src/automatic';
import {
    beforeEachSetup,
    domWithA11yIssues,
    domWithNoA11yIssues,
    domWithNoA11yIssuesChildCount,
    domWithDescendancyA11yIssues,
    customRulesFilePath,
} from '@sa11y/test-utils';
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
        expect(registerAutomaticMock).toHaveBeenCalledWith(
            expect.objectContaining({
                runAfterEach: false,
                cleanupAfterEach: false,
                consolidateResults: false,
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

describe('automatic checks call', () => {
    const testPath = expect.getState().testPath || 'defaultPath';
    const nonExistentFilePaths = ['foo', `foo${testPath}`, `${testPath}foo`];
    // Note: cleanup required at end of each test to prevent dom being checked again
    // after the test as part of the afterEach automatic check hook
    beforeEach(beforeEachSetup);

    it('should not raise a11y issues for DOM without a11y issues', () => {
        document.body.innerHTML = domWithNoA11yIssues;
        return expect(automaticCheck()).resolves.not.toThrow();
    });

    it('should raise a11y issues for DOM with a11y issues', async () => {
        document.body.innerHTML = domWithA11yIssues;
        await expect(automaticCheck({ cleanupAfterEach: true })).rejects.toThrow('1 Accessibility');
    });

    it.each([0, 1, 2, 3])(
        'should raise consolidated a11y issues for DOM with multiple a11y issues',
        async (numNodesWithIssues: number) => {
            document.body.innerHTML = domWithA11yIssues;

            // Note: Create multiple children in body with a11y issues
            for (let i = 0; i < numNodesWithIssues; i++) {
                document.body.innerHTML += `<a id="link-${i}" href="#"></a>`;
            }
            await expect(automaticCheck({ cleanupAfterEach: true })).rejects.toThrow();
        }
    );

    it('should cleanup DOM by default', async () => {
        document.body.innerHTML = domWithNoA11yIssues;
        expect(document.body.childElementCount).toBe(domWithNoA11yIssuesChildCount);
        await automaticCheck();
        expect(document.body.childElementCount).toBe(0);
    });

    it('should not cleanup DOM when opted out', async () => {
        document.body.innerHTML = domWithNoA11yIssues;
        expect(document.body.childElementCount).toBe(domWithNoA11yIssuesChildCount);
        await automaticCheck({ cleanupAfterEach: false });
        expect(document.body.childElementCount).toBe(domWithNoA11yIssuesChildCount);
    });

    it('should not raise error for duplicated issues', async () => {
        // TODO (Refactor): extract out duplicated code to set dom, expect assertions and invoke automatic check
        document.body.innerHTML = domWithA11yIssues;
        const opts = { cleanupAfterEach: false, consolidateResults: true };
        await expect(automaticCheck(opts)).rejects.toThrow();
        // Should not throw error for the same DOM with consolidation
        await expect(automaticCheck(opts)).resolves.toBeUndefined();
        // Should throw error again without consolidation
        await expect(automaticCheck({ cleanupAfterEach: true, consolidateResults: false })).rejects.toThrow();
    });

    it('should skip descendancy checks', async () => {
        document.body.innerHTML = domWithDescendancyA11yIssues;
        const opts = { cleanupAfterEach: false };
        await expect(automaticCheck(opts)).resolves.toBeUndefined();
    });

    it.each([
        ['foo', undefined, false],
        ['foo', [], false],
        ['foo', ['foo'], true],
        ['foo', ['Foo'], true],
        ['foo', ['foo', 'bar'], true],
        ['foo', ['bar'], false],
        ['foo', ['foobar'], false],
        ['foo', ['barfoo'], false],
    ])(
        'should filter test file as expected with args # %#',
        (testPath: string, filesFilter: string[] | undefined, expectedResult: boolean) => {
            expect(skipTest(testPath, filesFilter)).toBe(expectedResult);
        }
    );

    it('should skip auto checks when file is excluded using filter', async () => {
        document.body.innerHTML = domWithA11yIssues;
        await expect(automaticCheck({ filesFilter: [...nonExistentFilePaths, testPath] })).resolves.toBeUndefined();
    });

    it('should run auto checks when file is not excluded using filter', async () => {
        document.body.innerHTML = domWithA11yIssues;
        await expect(automaticCheck({ filesFilter: nonExistentFilePaths })).rejects.toThrow();
    });

    it('should take only custom rules if specified/testing for new rule', async () => {
        document.body.innerHTML = domWithA11yIssues;
        process.env.SA11Y_CUSTOM_RULES = customRulesFilePath;
        await expect(automaticCheck({ cleanupAfterEach: true })).rejects.toThrow('2 Accessibility');
        delete process.env.SA11Y_CUSTOM_RULES;
    });

    it('should pass filter selector keywords', async () => {
        document.body.innerHTML = domWithA11yIssues;
        process.env.SELECTOR_FILTER_KEYWORDS = 'lightning-';
        await expect(automaticCheck({ filesFilter: nonExistentFilePaths })).rejects.toThrow();
        delete process.env.SELECTOR_FILTER_KEYWORDS;
    });
});
