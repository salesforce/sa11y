/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { exceptionListFilter, exceptionListFilterSelectorKeywords } from '../src';
import { AxeResults } from '@sa11y/common';
import { getViolations } from './format.test';
import { expect } from '@jest/globals';

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
                        impact: 'serious',
                        message:
                            'aria-label attribute cannot be used on a lightning-button-icon with no valid role attribute.',
                    },
                ],
                impact: 'serious',
                html: '<lightning-button-icon lwc-2pdnejk934a="" class="slds-button slds-button_icon slds-button_icon-small slds-float_right slds-popover__close" aria-label="AgentWhisper.CloseDialog" title="AgentWhisper.CloseDialog"></lightning-button-icon>',
                target: ['lightning-button-icon'],
            },
        ],
    },
    {
        id: 'aria-dialog-name',
        impact: 'serious',
        tags: ['cat.aria', 'best-practice'],
        description: 'Ensures every ARIA dialog and alertdialog node has an accessible name',
        help: 'ARIA dialog and alertdialog nodes should have an accessible name',
        helpUrl: 'https://dequeuniversity.com/rules/axe/4.7/aria-dialog-name?application=axeAPI',
        nodes: [
            {
                any: [
                    {
                        id: 'aria-label',
                        data: null,
                        relatedNodes: [],
                        impact: 'serious',
                        message: 'aria-label attribute does not exist or is empty',
                    },
                    {
                        id: 'aria-labelledby',
                        data: null,
                        relatedNodes: [],
                        impact: 'serious',
                        message:
                            'aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty',
                    },
                    {
                        id: 'non-empty-title',
                        data: {
                            messageKey: 'noAttr',
                        },
                        relatedNodes: [],
                        impact: 'serious',
                        message: 'Element has no title attribute',
                    },
                ],
                all: [],
                none: [],
                impact: 'serious',
                html: '<section lwc-2pdnejk934a="" class="slds-popover popover-position-fixed slds-nubbin_top popover-container-bottom" aria-describedby="dialog-body-id-113-0" aria-labelledby="dialog-heading-id-5-0" role="dialog" style="--scrollOffset: 0px;">',
                target: ['section'],
            },
        ],
    },
];

let violations: AxeResults = [];
beforeAll(async () => {
    violations = await getViolations();
});

describe('a11y results filter', () => {
    it('should be setup with violations that can be reused across tests', () => {
        expect(violations).toMatchSnapshot();
    });

    it('should not filter results for default empty exception list', () => {
        expect(exceptionListFilter(violations)).toStrictEqual(violations);
    });

    it('should not filter results for empty violations list)', () => {
        expect(exceptionListFilter([])).toStrictEqual([]);
    });

    it.each([
        {},
        { nonExistingRule: ['foo', 'bar'] },
        { bypass: ['html5'] },
        { bypassFoo: ['html'] },
        { 'link-name': ['html'] },
        { 'document-title': ['a'], 'link-name': ['html'], 'bypass': ['a'] },
    ])('should not filter results for non-matching exception list %#', (exceptionList) => {
        expect(exceptionListFilter(violations, exceptionList)).toStrictEqual(violations);
    });

    it.each([
        { 'document-title': ['html'] },
        { 'link-name': ['a'] },
        { 'document-title': ['html'], 'link-name': ['a'] },
    ])('should filter results for matching exception list %#', (exceptionList) => {
        const filteredViolations = exceptionListFilter(violations, exceptionList);
        expect(filteredViolations).not.toStrictEqual(violations);
        const filteredRuleIDs = filteredViolations.map((violation) => violation.id);
        expect(filteredRuleIDs).not.toContain(Object.keys(exceptionList));
        expect(filteredViolations).toMatchSnapshot();
    });

    it('should filter results appropriately for exception list with both matching and non-matching items', () => {
        const validRule = 'document-title'; // Rule with valid css selector that matches violations
        const mixedExceptionList = { 'document-title': ['html'], 'link-name': ['html'], 'bypass': ['a'] };
        const ruleIDs = violations.map((violation) => violation.id);
        const filteredViolations = exceptionListFilter(violations, mixedExceptionList);
        const filteredRuleIDs = filteredViolations.map((violation) => violation.id);
        expect(filteredRuleIDs).not.toContain(validRule);
        expect(ruleIDs).toContain(validRule);
        expect(ruleIDs.filter((ruleID) => ruleID !== validRule)).toStrictEqual(filteredRuleIDs);
    });

    it('should filter violations based on selector keywords', () => {
        // add ancestry keys
        mockViolations[0].nodes[0]['ancestry'] = [
            'html > body > agent-whisper-popover > section > lightning-button-icon:nth-child(1)',
        ];
        mockViolations[1].nodes[0]['ancestry'] = ['html > body > agent-whisper-popover > section'];

        const filteredViolations = exceptionListFilterSelectorKeywords(mockViolations as AxeResults, ['lightning-']);
        expect(filteredViolations).toHaveLength(1);
    });

    it('should not filter violations if no ancestry keys defined', () => {
        delete mockViolations[0].nodes[0]['ancestry'];
        delete mockViolations[1].nodes[0]['ancestry'];

        const filteredViolations = exceptionListFilterSelectorKeywords(mockViolations as AxeResults, ['lightning-']);
        expect(filteredViolations).toHaveLength(2);
    });
});
