/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { exceptionListFilter } from '../src';
import { AxeResults } from '@sa11y/common';
import { getViolations } from './format.test';

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
});
