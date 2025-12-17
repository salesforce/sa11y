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
import {
    setOriginalDocumentBodyHtml,
    getOriginalDocumentBodyHtml,
    observerOptions,
    defaultAutoCheckOpts,
    defaultRenderedDOMSaveOpts,
} from '../src/automatic';
import * as common from '@sa11y/common';
import * as assert from '@sa11y/assert';

describe('automatic checks call', () => {
    const testPath = expect.getState().testPath || 'defaultPath';
    const testName = expect.getState().currentTestName || 'defaultTestName';
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

    test.each([0, 1, 2, 3])(
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

    test.each([
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
            runAutomaticCheck(
                { filesFilter: [...nonExistentFilePaths, testPath] },
                { renderedDOMDumpDirPath: '' },
                testPath,
                testName
            )
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
        ).rejects.toThrow('2 Accessibility');
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
                { renderedDOMDumpDirPath: '' },
                testPath,
                testName
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

describe('automatic.ts exports', () => {
    afterEach(() => {
        setOriginalDocumentBodyHtml(null);
    });

    it('setOriginalDocumentBodyHtml and getOriginalDocumentBodyHtml should set and get the value', () => {
        setOriginalDocumentBodyHtml('<div>test</div>');
        expect(getOriginalDocumentBodyHtml()).toBe('<div>test</div>');
        setOriginalDocumentBodyHtml(null);
        expect(getOriginalDocumentBodyHtml()).toBeNull();
    });

    it('observerOptions should have the correct structure', () => {
        expect(observerOptions).toEqual({
            subtree: true,
            childList: true,
            attributes: true,
            characterData: true,
        });
    });

    it('defaultAutoCheckOpts should have the correct defaults', () => {
        expect(defaultAutoCheckOpts).toEqual({
            runAfterEach: true,
            cleanupAfterEach: true,
            consolidateResults: true,
            filesFilter: [],
            runDOMMutationObserver: false,
            enableIncompleteResults: false,
        });
    });

    it('defaultRenderedDOMSaveOpts should have the correct defaults', () => {
        expect(defaultRenderedDOMSaveOpts).toEqual({
            renderedDOMDumpDirPath: '',
        });
    });
});

describe('runAutomaticCheck runDOMMutationObserver checks', () => {
    const mockViolations = [
        {
            id: 'aria-allowed-attr',
            impact: 'serious',
            tags: ['cat.aria', 'wcag2a', 'wcag412'],
            description: "Ensures ARIA attributes are allowed for an element's role",
            help: 'Elements must only use allowed ARIA attributes',
            helpUrl: 'https://dequeuniversity.com/rules/axe/4.7/aria-allowed-attr?application=axeAPI',
            nodes: [
                {
                    any: [],
                    all: [],
                    none: [
                        {
                            id: 'aria-prohibited-attr',
                            data: {
                                role: null,
                                nodeName: 'lightning-button-icon',
                                messageKey: 'noRoleSingular',
                                prohibited: ['aria-label'],
                            },
                            relatedNodes: [],
                            message:
                                'aria-label attribute cannot be used on a lightning-button-icon with no valid role attribute.',
                        },
                    ],
                    html: '<lightning-button-icon lwc-2pdnejk934a="" class="slds-button slds-button_icon slds-button_icon-small slds-float_right slds-popover__close" aria-label="AgentWhisper.CloseDialog" title="AgentWhisper.CloseDialog"></lightning-button-icon>',
                    target: ['lightning-button-icon'],
                },
            ],
        },
    ];

    afterEach(() => {
        setOriginalDocumentBodyHtml(null);
        delete process.env.SELECTOR_FILTER_KEYWORDS;
        jest.restoreAllMocks();
    });

    it('should early return if isFakeTimerUsed returns true', async () => {
        const spy = jest.spyOn(common, 'useCustomRules');
        await runAutomaticCheck({}, {}, '', '', () => true);
        expect(spy).not.toHaveBeenCalled();
    });

    it('should restore originalDocumentBodyHtml if set', async () => {
        document.body.innerHTML = '<div>changed</div>';
        setOriginalDocumentBodyHtml('<div>original</div>');
        await runAutomaticCheck();
        expect(document.body.innerHTML).toBe('');
    });

    it('should handle runDOMMutationObserver with file save and error', async () => {
        const writeHtmlSpy = jest.spyOn(common, 'writeHtmlFileInPath').mockImplementation(() => {
            throw new Error('fail');
        });
        jest.spyOn(assert, 'getA11yResultsJSDOM').mockImplementation(() => {
            return new Promise((resolve) => {
                resolve(mockViolations as unknown as common.AxeResults);
            });
        });
        const opts = {
            runDOMMutationObserver: true,
        };
        const renderedDOMSaveOpts = {
            renderedDOMDumpDirPath: 'dir',
            generateRenderedDOMFileSaveLocation: () => ({ fileName: 'file.html', fileUrl: 'url' }),
        };
        document.body.innerHTML = '<div>test</div>';
        try {
            await runAutomaticCheck(opts, renderedDOMSaveOpts, 'testPath', 'testName');
        } catch (e) {
            // empty here to avoid jest error
        }
        expect(writeHtmlSpy).toHaveBeenCalled();
    });

    it('should handle runDOMMutationObserver with missing testPath/testName', async () => {
        const writeHtmlSpy = jest.spyOn(common, 'writeHtmlFileInPath');
        const opts = {
            runDOMMutationObserver: true,
        };
        const renderedDOMSaveOpts = {
            renderedDOMDumpDirPath: 'dir',
            generateRenderedDOMFileSaveLocation: () => ({ fileName: 'file.html', fileUrl: 'url' }),
        };
        document.body.innerHTML = '<div>test</div>';
        await runAutomaticCheck(opts, renderedDOMSaveOpts, '', '');
        expect(writeHtmlSpy).not.toHaveBeenCalled();
    });
});
