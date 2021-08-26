/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { base, full, extended, defaultRuleset, excludedRules, getDefaultRuleset } from '../src';
import * as axe from 'axe-core';
import * as fs from 'fs';
import * as path from 'path';
import { axeVersion } from '@sa11y/common';
import { extendedRulesInfo } from '../src/extended';
import { getRulesDoc } from '../src/docgen';
import { RuleInfo } from '../src/rules';

/**
 * TODO:
 *  - Add benchmark test for individual rules using https://github.com/salesforce/best
 * */

describe('preset-rules', () => {
    afterAll(() => {
        process.env.SA11Y_RULESET = '';
    });

    it('should match all axe rules with full ruleset', () => {
        expect(
            axe
                .getRules()
                .map((ruleObj) => ruleObj.ruleId)
                .sort()
        ).toEqual(full.runOnly.values);
    });

    it('should match ruleset hierarchy full -> extended', () => {
        expect(full.runOnly.values).toEqual(expect.arrayContaining([...extended.runOnly.values, ...excludedRules]));
    });

    it('should match ruleset hierarchy extended -> base', () => {
        expect(extended.runOnly.values).not.toEqual(base.runOnly.values);
        expect(extended.runOnly.values).toEqual(expect.arrayContaining(base.runOnly.values));
    });

    it('should contain both WCAG SC and Level or none', () => {
        expect(
            Array.from(extendedRulesInfo.values()).filter(
                (ruleInfo) => !ruleInfo.wcagSC && ruleInfo.wcagSC !== ruleInfo.wcagLevel
            )
        ).toHaveLength(0);
    });

    it('should not contain excluded, deprecated rules', () => {
        expect(extended.runOnly.values.filter((rule) => excludedRules.includes(rule))).toHaveLength(0);
    });

    it('should not use only the excluded, deprecated rules from axe', () => {
        expect(full.runOnly.values).toEqual(expect.arrayContaining(excludedRules));
        const unusedRules = full.runOnly.values.filter((rule) => !extended.runOnly.values.includes(rule));
        expect(unusedRules.sort()).toEqual(excludedRules.sort());
    });

    it('should default to base', () => {
        expect(getDefaultRuleset()).toEqual(base);
        expect(defaultRuleset).toEqual(base);
    });

    it('should change default ruleset based on env override', () => {
        process.env.SA11Y_RULESET = 'full';
        expect(getDefaultRuleset()).toEqual(full);
        // defaultRuleset initialized at beginning, so wouldn't reflect runtime overrides
        expect(defaultRuleset).toEqual(base);
    });
});

describe('preset-rules documentation', () => {
    const readmePath = path.resolve(__dirname, '../README.md');
    const readme = fs.readFileSync(readmePath).toString();

    it('should document all rules', () => {
        // Note: to update the readme when rulesets are updated, pass in the readmePath
        // expect(readme).toContain(getRulesDoc(readmePath));
        expect(readme).toContain(getRulesDoc());
    });

    it('should throw error for non existent rule', () => {
        expect(() => getRulesDoc(new Map([['foo', {}]]) as RuleInfo)).toThrowErrorMatchingSnapshot();
    });

    it('should contain all rules from extended', () => {
        const version = axeVersion.split('.').slice(0, 2).join('.'); // extract just major and minor version
        extended.runOnly.values
            // TODO (test): Add test to check that excluded rules are not present in the doc
            .filter((rule) => !excludedRules.includes(rule))
            .forEach((rule) => {
                const ruleWithLink = `[${rule}](https://dequeuniversity.com/rules/axe/${version}/${rule})`;
                expect(readme).toContain(ruleWithLink);
                // TODO (fix): regex to detect duplicate doc
                // should document the rule only once
                // expect(RegExp(rule, 'g').exec(readme)).toHaveLength(1);
            });
    });
});
