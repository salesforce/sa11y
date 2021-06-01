/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { WcagMetadata } from '../src/wcag';

// input tags, expected version, expected level, expected SC
const noErrorCases = [
    [['wcag2a'], '2.0', 'A', WcagMetadata.defaultSC],
    [['wcag21aaa'], '2.1', 'AAA', WcagMetadata.defaultSC],
    [['wcag222', 'wcag21aa'], '2.1', 'AA', '2.2.2'],
];

const errorCases = [
    [['wcag222'], undefined, undefined, '2.2.2'],
    [[], undefined, undefined, WcagMetadata.defaultSC],
    [['foo', 'bar'], undefined, undefined, WcagMetadata.defaultSC],
    [['wcag2foo', 'wcag21bar'], undefined, undefined, WcagMetadata.defaultSC],
];

describe('WCAG Metadata extractor', () => {
    it.each([...noErrorCases, ...errorCases])(
        'should extract WCAG version and level (arg:%p)',
        (tags: string[], wcagVersion: string, wcagLevel: string, successCriteria: string) => {
            const wcag = new WcagMetadata(tags);
            expect(wcag.wcagVersion).toBe(wcagVersion);
            expect(wcag.wcagLevel).toBe(wcagLevel);
            expect(wcag.successCriteria).toBe(successCriteria);
        }
    );

    it.each(noErrorCases)(
        'should format WCAG metadata when required data is present (arg:%p)',
        (tags: string[], wcagVersion: string, wcagLevel: string, successCriteria: string) => {
            const wcag = new WcagMetadata(tags).toString();
            expect(wcag).toMatchSnapshot();
            expect(wcag).toContain(wcagVersion);
            expect(wcag).toContain(wcagLevel);
            expect(wcag).toContain(successCriteria);
        }
    );

    it.each(errorCases)(
        'should throw error when required data is not present (arg:%p)',
        (tags: string[], _wcagVersion: string, _wcagLevel: string, _successCriteria: string) => {
            expect(() => new WcagMetadata(tags).toString()).toThrowErrorMatchingSnapshot();
        }
    );
});
