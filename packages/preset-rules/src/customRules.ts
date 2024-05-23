/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from 'fs';
import path from 'path';
import axe from 'axe-core';

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

        // Function to process JSON files in a directory and push their content to a target array
        const processJsonFiles = <T>(dir: string, targetArray: T[]): void => {
            const files = fs.readdirSync(dir);
            files.forEach((file) => {
                if (path.extname(file) === '.json') {
                    const filePath = path.join(dir, file);
                    const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
                    targetArray.push(fileData);
                }
            });
        };

        // Process checks and rules JSON files
        processJsonFiles<axe.Check>(path.join(directoryPath, 'checks'), newChecks);
        processJsonFiles<axe.Rule>(path.join(directoryPath, 'rules'), newRules);
    } catch (err) {
        console.error('Error in reading Custom Rules files:', err);
    }

    // Configure axe with the new checks and rules
    const spec: axe.Spec = { rules: newRules, checks: newChecks };
    axe.configure(spec);
}
