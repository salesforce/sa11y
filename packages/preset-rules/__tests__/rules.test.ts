/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { base, full, extended, defaultRuleset, excludedRules, getDefaultRuleset } from '../src';
import { baseRulesInfo } from '../src/base';
import { extendedRulesInfo } from '../src/extended';
import { getRulesDoc } from '../src/docgen';
import {
    filterRulesByPriority,
    getPriorityFilter,
    priorities,
    RuleInfo,
    adaptA11yConfig,
    adaptA11yConfigCustomRules,
    adaptA11yConfigIncompleteResults,
} from '../src/rules';
import { axeVersion } from '@sa11y/common';
import * as axe from 'axe-core';
import * as fs from 'fs';
import * as path from 'path';
import { expect } from '@jest/globals';

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

    it('should contain both WCAG SC, Level and no AAA rules for base ruleset', () => {
        expect(
            Array.from(baseRulesInfo.values()).filter(
                (ruleInfo) => !ruleInfo.wcagSC || !ruleInfo.wcagLevel || ruleInfo.wcagLevel === 'AAA'
            )
        ).toHaveLength(0);
    });

    it('should contain both WCAG SC and Level or none in base, extended rulesets', () => {
        expect(
            Array.from(extendedRulesInfo.values()).filter(
                (ruleInfo) => !ruleInfo.wcagSC && ruleInfo.wcagSC !== ruleInfo.wcagLevel
            )
        ).toHaveLength(0);
    });

    it('should not contain excluded, deprecated rules in base, extended rulesets', () => {
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
        // Note: To update the readme when rulesets are updated, pass in the readmePath
        //  after removing the existing outdated ruleset table.
        // expect(readme).toContain(getRulesDoc(readmePath));
        // remove space indent and verify
        expect(readme.replace(/\s+/g, ' ').trim()).toContain(getRulesDoc().replace(/\s+/g, ' ').trim());
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

describe('preset-rules priority config', () => {
    afterAll(() => {
        process.env.SA11Y_RULESET_PRIORITY = '';
    });

    it('should filter rules by given priority', () => {
        for (const priority of priorities) {
            if (!priority) continue;
            const filteredRules = filterRulesByPriority(extendedRulesInfo, priority);
            filteredRules.forEach((rule) => {
                expect(extendedRulesInfo.get(rule).priority).toEqual(priority);
            });
        }
    });

    it.each(priorities)('should set priority based on env var', (priority) => {
        process.env.SA11Y_RULESET_PRIORITY = priority;
        expect(getPriorityFilter()).toEqual(priority);
    });
});

describe('config adapt functions', () => {
    it.each([extended, base])('should customize %s preset-rule as expected', (config) => {
        expect(config.runOnly.values).toContain('color-contrast');
        expect(adaptA11yConfig(config).runOnly.values).not.toContain('color-contrast');
        // original ruleset is not modified
        expect(config.runOnly.values).toContain('color-contrast');
    });

    it('should customize preset-rule as expected for custom rules', () => {
        expect(base.runOnly.values).toContain('color-contrast');
        const rules = adaptA11yConfigCustomRules(base, ['rule1', 'rule2']).runOnly.values;
        expect(rules).toContain('rule1');
        expect(rules).toContain('rule2');

        // original ruleset is not modified
        expect(base.runOnly.values).toContain('color-contrast');
    });

    it('should customize config as expected for incomplete results', () => {
        expect(base.resultTypes[0]).toBe('violations');
        const changedResultType = adaptA11yConfigIncompleteResults(base).resultTypes[0];
        console.log('changedResultType', changedResultType);
        expect(changedResultType).toBe('incomplete');
    });
});
