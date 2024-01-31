/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { WcagMetadata } from '../src';
import { Result } from 'axe-core';
import { defaultWcagVersion } from '../src/rules';
import { extendedRulesInfo } from '../src/extended';
import { expect } from '@jest/globals';

// input tags, expected version, expected level, expected SC
const noErrorCases = [
    [['wcag2a'], '2.0', 'A', WcagMetadata.defaultSC],
    [['wcag21aaa'], '2.1', 'AAA', WcagMetadata.defaultSC],
    [['wcag222', 'wcag21aa'], '2.1', 'AA', '2.2.2'],
];

const errorCases = [
    [[], undefined, '', WcagMetadata.defaultSC],
    [[WcagMetadata.defaultSC], undefined, '', WcagMetadata.defaultSC],
    [['wcag222'], undefined, '', '2.2.2'],
    [['foo', 'bar'], undefined, '', WcagMetadata.defaultSC],
    [['wcag2foo', 'wcag21bar'], undefined, '', WcagMetadata.defaultSC],
];

describe('WCAG Metadata extractor', () => {
    it.each([...noErrorCases, ...errorCases])(
        'should extract WCAG version and level (arg:%p)',
        (tags: string[], wcagVersion: string, wcagLevel: string, successCriteria: string) => {
            const wcag = new WcagMetadata({ tags: tags } as Result);
            expect(wcag.wcagVersion).toBe(wcagVersion);
            expect(wcag.wcagLevel).toBe(wcagLevel);
            expect(wcag.successCriteria).toBe(successCriteria);
        }
    );

    it.each(noErrorCases)(
        'should format WCAG metadata when required data is present (arg:%p)',
        (tags: string[], wcagVersion: string, wcagLevel: string, successCriteria: string) => {
            const wcag = new WcagMetadata({ tags: tags } as Result).toString();
            expect(wcag).toMatchSnapshot();
            expect(wcag).toContain(successCriteria);
        }
    );

    it.each([
        'area-alt', // base rule
        'table-duplicate-name', // extended rule without WCAG SC
    ])('should populate WCAG metadata as expected for rule (arg:%p)', (ruleID) => {
        const wcag = new WcagMetadata({ id: ruleID, tags: [] } as Result);
        const ruleInfo = extendedRulesInfo.get(ruleID);
        expect(wcag.wcagVersion).toBe(defaultWcagVersion);
        expect(wcag.wcagLevel).toBe(ruleInfo.wcagLevel);
        expect(wcag.successCriteria).toBe(ruleInfo.wcagSC);
        expect(wcag.priority).toBe(ruleInfo.priority);
    });
});
