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

    it('should document all rules', () => {
        // TODO (feat): Can we automate generation of the README using a template ?
        const readmePath = path.resolve(__dirname, '../README.md');
        const readme = fs.readFileSync(readmePath).toString();
        const version = axeVersion.split('.').slice(0, 2).join('.'); // extract just major and minor version
        full.runOnly.values
            .filter((rule) => !excludedRules.includes(rule))
            .forEach((rule) => {
                expect(readme).toContain(`| [${rule}](https://dequeuniversity.com/rules/axe/${version}/${rule})`);
            });
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
