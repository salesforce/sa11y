/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
'use strict';

import { extended } from '../lib/extended';
import { recommended } from '../lib/recommended';
import { common } from '../lib/common';
import axe from 'axe-core';

/**
 * TODO:
 *  - Add benchmark test for individual rules using https://github.com/salesforce/best
 * */

describe('@sa11y/rules sanity checks', () => {
    it('recommended is a subset of extended', () => {
        expect(extended.runOnly.values).toEqual(expect.arrayContaining(recommended.runOnly.values));
        // TODO (debug): Why is this failing?
        // expect(extended).toEqual(expect.objectContaining(recommended));
    });

    it('all rulesets have the desired properties from defaults', () => {
        [extended, recommended].forEach(ruleset => {
            expect(ruleset.runOnly.type).toEqual(common.runOnly.type);
            expect(ruleset.resultTypes).toEqual(common.resultTypes);
        });
    });
});

describe('@sa11y/rules sanity checks with axe', () => {
    const excludedRules = [
        'aria-dpub-role-fallback',
        'checkboxgroup',
        'frame-title-unique',
        'hidden-content',
        'layout-table',
        'radiogroup',
        'skip-link',
        'table-duplicate-name',
        'table-fake-caption',
        'video-description',
    ];
    const axeRules = axe.getRules().map(ruleObj => ruleObj.ruleId);

    it('should not contain excluded, deprecated rules', () => {
        expect(extended.runOnly.values).toEqual(expect.not.arrayContaining(excludedRules));
    });

    it('all rules are present in axe', () => {
        expect(axeRules).toEqual(expect.arrayContaining(extended.runOnly.values));
    });

    it('only rules not used from axe are excluded, deprecated rules', () => {
        const unusedRules = axeRules.filter(rule => !extended.runOnly.values.includes(rule));
        expect(unusedRules.sort()).toEqual(excludedRules.sort());
    });
});
