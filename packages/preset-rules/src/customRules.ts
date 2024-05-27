/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from 'fs';
import path from 'path';
import axe from 'axe-core';
import { processFiles } from '@sa11y/common';

// Directory containing custom rules and checks
const customRulesPathDir = 'custom-rules';

export function registerCustomRules(): void {
    const directoryPath = path.join(__dirname, customRulesPathDir);
    const newChecks: axe.Check[] = [];
    const newRules: axe.Rule[] = [];

    try {
        // Path to the JSON file with changes to existing rules
        const changesInExistingRulesPath = path.join(directoryPath, 'changes.json');
        // Read and parse existing rule changes
        const existingRuleData = fs.readFileSync(changesInExistingRulesPath, 'utf-8');
        const { rules } = JSON.parse(existingRuleData) as { rules: axe.Rule[] };
        if (rules && Array.isArray(rules)) {
            newRules.push(...rules);
        }

        // Process checks and rules JSON files
        processFiles<axe.Check>(path.join(directoryPath, 'checks'), newChecks, '.json', JSON.parse);
        processFiles<axe.Rule>(path.join(directoryPath, 'rules'), newRules, '.json', JSON.parse);
    } catch (e) {
        const err = e as Error;
        console.error('Error in reading Custom Rules files: ', err.message);
    }

    // Configure axe with the new checks and rules
    const spec: axe.Spec = { rules: newRules, checks: newChecks };
    axe.configure(spec);
}
