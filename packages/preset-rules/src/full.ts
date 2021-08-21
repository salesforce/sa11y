/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { defaultPriority, getA11yConfig } from './rules';
import { recommendedRulesInfo } from './recommended';

// Rules that have been excluded due to being new or deprecated by axe
export const excludedRules = [];

// Add excluded rules to recommended to get the full list
excludedRules.forEach((rule) =>
    recommendedRulesInfo.set(rule, { priority: defaultPriority, wcagSC: '', wcagLevel: '' })
);

export const full = getA11yConfig(recommendedRulesInfo);
