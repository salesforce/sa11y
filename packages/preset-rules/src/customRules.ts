/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import axe from 'axe-core';
import checkData from './custom-rules/checks';
import rulesData from './custom-rules/rules';
import changes from './custom-rules/changes';

export function registerCustomRules(): void {
    const newChecks: axe.Check[] = [];
    const newRules: axe.Rule[] = [];

    // Read and parse existing rule changes
    const { rules } = changes;
    const newRulesData = rulesData;
    const newChecksData = checkData;

    if (rules && Array.isArray(rules)) {
        newRules.push(...rules);
    }
    newRules.push(...newRulesData);
    newChecks.push(...newChecksData);

    // Configure axe with the new checks and rules
    const spec: axe.Spec = { rules: newRules, checks: newChecks };
    axe.configure(spec);
}
