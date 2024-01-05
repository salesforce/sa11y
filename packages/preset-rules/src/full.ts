/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { defaultPriority, getA11yConfig } from './rules';
import { extendedRulesInfo } from './extended';

// Rules that have been excluded due to being new or deprecated by axe
export const excludedRules = [
    'aria-braille-equivalent',
    'aria-conditional-attr',
    'aria-prohibited-attr',
    'aria-deprecated-role',
];

// Add excluded rules to extended to get the full list
excludedRules.forEach((rule) => extendedRulesInfo.set(rule, { priority: defaultPriority, wcagSC: '', wcagLevel: '' }));

export const full = getA11yConfig(extendedRulesInfo);
