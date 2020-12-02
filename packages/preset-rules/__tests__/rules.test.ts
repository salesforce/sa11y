/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { base, full, recommended } from '../src';
import * as fs from 'fs';
import * as path from 'path';
import { axeVersion } from '@sa11y/common';

/**
 * TODO:
 *  - Add benchmark test for individual rules using https://github.com/salesforce/best
 * */

describe('preset-rules', () => {
    // Rules that have been excluded from running due to being deprecated by axe
    // or due to their experimental nature
    const excludedRules = [
        /* cSpell:disable */
        'frame-title-unique',
        'hidden-content',
        'skip-link',
        'table-duplicate-name',
        'table-fake-caption',
        /* cSpell:enable */
    ];

    it('should match ruleset hierarchy full -> recommended', () => {
        expect(full.runOnly.values).not.toEqual(recommended.runOnly.values);
        expect(full.runOnly.values).toEqual(expect.arrayContaining(recommended.runOnly.values));
    });

    it('should match ruleset hierarchy recommended -> base', () => {
        expect(recommended.runOnly.values).not.toEqual(base.runOnly.values);
        expect(recommended.runOnly.values).toEqual(expect.arrayContaining(base.runOnly.values));
    });

    it('should not contain excluded, deprecated rules', () => {
        expect(recommended.runOnly.values).toEqual(expect.not.arrayContaining(excludedRules));
    });

    it('should not use only the excluded, deprecated rules from axe', () => {
        expect(full.runOnly.values).toEqual(expect.arrayContaining(excludedRules));
        const unusedRules = full.runOnly.values.filter((rule) => !recommended.runOnly.values.includes(rule));
        expect(unusedRules.sort()).toEqual(excludedRules.sort());
    });

    it('should document all recommended rules', () => {
        // TODO (feat): Can we automate generation of the README using a template ?
        const readmePath = path.resolve(__dirname, '../README.md');
        const readme = fs.readFileSync(readmePath).toString();
        const version = axeVersion.split('.').slice(0, 2).join('.'); // extract just major and minor version
        full.runOnly.values.forEach((rule) => {
            expect(readme).toContain(`| [${rule}](https://dequeuniversity.com/rules/axe/${version}/${rule})`);
        });
    });
});
