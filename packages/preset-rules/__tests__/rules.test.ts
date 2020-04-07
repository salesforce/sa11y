/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import axe from 'axe-core';
import { extended } from '../src';
import { recommended } from '../src';

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
});

describe('@sa11y/rules sanity checks with axe', () => {
    // Rules that have been excluded from running due to being deprecated by axe
    // or due to their experimental nature
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
    const axeRules = axe.getRules().map((ruleObj) => ruleObj.ruleId);

    it('should not contain excluded, deprecated rules', () => {
        expect(extended.runOnly.values).toEqual(expect.not.arrayContaining(excludedRules));
    });

    it('all rules are present in axe', () => {
        expect(axeRules).toEqual(expect.arrayContaining(extended.runOnly.values));
    });

    it('only rules not used from axe are excluded, deprecated rules', () => {
        const unusedRules = axeRules.filter((rule) => !extended.runOnly.values.includes(rule));
        expect(unusedRules.sort()).toEqual(excludedRules.sort());
    });
});
