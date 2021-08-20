/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { getA11yConfig } from './rules';
import { recommendedRulesInfo } from './recommended';

// Rules that have been excluded due to being new or deprecated by axe
// or due to their experimental nature
export const excludedRules = [
    /* cSpell:disable */
    // TODO (fix): Temp disable new rules in axe 4.2.
    //  They will be added to the preset-rules in a future release
    'aria-text', // new in axe 4.2
    'empty-table-header', // new in axe 4.2
    'frame-focusable-content', // new in axe 4.2
    'nested-interactive', // new in axe 4.2
    'frame-title-unique',
    'hidden-content',
    'skip-link',
    'table-duplicate-name',
    'table-fake-caption',
    /* cSpell:enable */
];

// Add excluded rules to recommended to get the full list
excludedRules.forEach((rule) => recommendedRulesInfo.set(rule, { priority: 'P3', wcagSC: '' }));

export const full = getA11yConfig(recommendedRulesInfo);
