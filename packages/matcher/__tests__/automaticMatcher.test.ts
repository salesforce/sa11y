/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { runAutomaticCheck, skipTest, registerCustomSa11yRules } from '../src';

import {
    beforeEachSetup,
    domWithA11yIssues,
    domWithNoA11yIssues,
    domWithNoA11yIssuesChildCount,
    domWithDescendancyA11yIssues,
    customRulesFilePath,
    domWithA11yCustomIssues,
    domWithA11yIncompleteIssues,
} from '@sa11y/test-utils';
import { expect } from '@jest/globals';

describe('automatic checks call', () => {
    const testPath = expect.getState().testPath || 'defaultPath';
    const nonExistentFilePaths = ['foo', `foo${testPath}`, `${testPath}foo`];
    // Note: cleanup required at end of each test to prevent dom being checked again
    // after the test as part of the afterEach automatic check hook
    beforeEach(beforeEachSetup);

    it('should not raise a11y issues for DOM without a11y issues', () => {
        document.body.innerHTML = domWithNoA11yIssues;
        return expect(runAutomaticCheck()).resolves.not.toThrow();
    });

    it('should raise a11y issues for DOM with a11y issues', async () => {
        document.body.innerHTML = domWithA11yIssues;
        await expect(runAutomaticCheck({ cleanupAfterEach: true })).rejects.toThrow('1 Accessibility');
    });

    it.each([0, 1, 2, 3])(
        'should raise consolidated a11y issues for DOM with multiple a11y issues',
        async (numNodesWithIssues: number) => {
            document.body.innerHTML = domWithA11yIssues;

            // Note: Create multiple children in body with a11y issues
            for (let i = 0; i < numNodesWithIssues; i++) {
                document.body.innerHTML += `<a id="link-${i}" href="#"></a>`;
            }
            await expect(runAutomaticCheck({ cleanupAfterEach: true })).rejects.toThrow();
        }
    );

    it('should cleanup DOM by default', async () => {
        document.body.innerHTML = domWithNoA11yIssues;
        expect(document.body.childElementCount).toBe(domWithNoA11yIssuesChildCount);
        await runAutomaticCheck();
        expect(document.body.childElementCount).toBe(0);
    });

    it('should not cleanup DOM when opted out', async () => {
        document.body.innerHTML = domWithNoA11yIssues;
        expect(document.body.childElementCount).toBe(domWithNoA11yIssuesChildCount);
        await runAutomaticCheck({ cleanupAfterEach: false });
        expect(document.body.childElementCount).toBe(domWithNoA11yIssuesChildCount);
    });

    it('should not raise error for duplicated issues', async () => {
        // TODO (Refactor): extract out duplicated code to set dom, expect assertions and invoke automatic check
        document.body.innerHTML = domWithA11yIssues;
        const opts = { cleanupAfterEach: false, consolidateResults: true };
        await expect(runAutomaticCheck(opts)).rejects.toThrow();
        // Should not throw error for the same DOM with consolidation
        await expect(runAutomaticCheck(opts)).resolves.toBeUndefined();
        // Should throw error again without consolidation
        await expect(runAutomaticCheck({ cleanupAfterEach: true, consolidateResults: false })).rejects.toThrow();
    });

    it('should skip descendancy checks', async () => {
        document.body.innerHTML = domWithDescendancyA11yIssues;
        const opts = { cleanupAfterEach: false };
        await expect(runAutomaticCheck(opts)).resolves.toBeUndefined();
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
        await expect(
            runAutomaticCheck({ filesFilter: [...nonExistentFilePaths, testPath] }, testPath)
        ).resolves.toBeUndefined();
    });

    it('should run auto checks when file is not excluded using filter', async () => {
        document.body.innerHTML = domWithA11yIssues;
        await expect(runAutomaticCheck({ filesFilter: nonExistentFilePaths })).rejects.toThrow();
    });

    it('should incomplete rules', async () => {
        registerCustomSa11yRules();
        document.body.innerHTML = domWithA11yIncompleteIssues;
        process.env.SA11Y_CUSTOM_RULES = customRulesFilePath;
        await expect(
            runAutomaticCheck({ cleanupAfterEach: true, enableIncompleteResults: true, consolidateResults: true })
        ).rejects.toThrow('1 Accessibility');
        delete process.env.SA11Y_CUSTOM_RULES;
    });

    it('should take only custom rules if specified/testing for new rule', async () => {
        registerCustomSa11yRules();
        document.body.innerHTML = domWithA11yCustomIssues;
        process.env.SA11Y_CUSTOM_RULES = customRulesFilePath;
        await expect(runAutomaticCheck({ cleanupAfterEach: true })).rejects.toThrow('1 Accessibility');
        delete process.env.SA11Y_CUSTOM_RULES;
    });

    it('should pass filter selector keywords', async () => {
        registerCustomSa11yRules();
        document.body.innerHTML = domWithA11yIssues;
        process.env.SELECTOR_FILTER_KEYWORDS = 'lightning-';
        await expect(runAutomaticCheck({ filesFilter: nonExistentFilePaths })).rejects.toThrow();
        delete process.env.SELECTOR_FILTER_KEYWORDS;
    });

    it('should pass when run in DOM Mutation Observer mode', async () => {
        document.body.innerHTML = domWithA11yIssues;
        await expect(
            runAutomaticCheck(
                { filesFilter: [...nonExistentFilePaths, testPath], runDOMMutationObserver: true },
                testPath
            )
        ).resolves.toBeUndefined();
    });

    it('should take only custom rules if specified/testing for new rule in DOM Mutation Observer mode', async () => {
        registerCustomSa11yRules();
        document.body.innerHTML = domWithA11yCustomIssues;
        process.env.SA11Y_CUSTOM_RULES = customRulesFilePath;
        await expect(runAutomaticCheck({ cleanupAfterEach: true, runDOMMutationObserver: true })).rejects.toThrow(
            '1 Accessibility'
        );
        delete process.env.SA11Y_CUSTOM_RULES;
    });
});
