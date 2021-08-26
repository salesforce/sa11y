/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { getAxeRules, log } from '@sa11y/common';
import { baseRulesInfo } from './base';
import { extendedRulesInfo } from './extended';
import * as fs from 'fs';
import { getMarkdownTable } from 'markdown-table-ts';

/**
 * Generate markdown table of rules with the rules metadata.
 * Called from the rules tests.
 * @param rulesInfo - preset-rule to generate docs for. Defaults to
 * @param updateReadmePath - append given file with generated rules md doc
 */
export function getRulesDoc(rulesInfo = extendedRulesInfo, updateReadmePath = ''): string {
    const rulesDocRows: string[][] = [];
    // Markers used to denote if a rule belongs in base, extended ruleset
    const no = '✖️';
    const yes = '✅';
    const axeRules = getAxeRules();
    for (const [ruleID, ruleMetadata] of rulesInfo.entries()) {
        const axeRule = axeRules.get(ruleID);
        if (!axeRule) throw new Error(`Unable to find rule: ${ruleID}`);

        rulesDocRows.push([
            `[${ruleID}](${axeRule.helpUrl.split('?')[0]})`, // remove URL referrer for cleaner/shorter doc
            axeRule.description.replace(/</g, '&lt;'),
            ruleMetadata.wcagSC,
            ruleMetadata.wcagLevel,
            ruleMetadata.priority,
            baseRulesInfo.has(ruleID) ? yes : no,
            yes,
        ]);
    }

    const table = getMarkdownTable({
        table: {
            head: [
                'Rule ID',
                'Description',
                'WCAG SC',
                'WCAG Level',
                'Priority',
                'In Base ruleset',
                'In Extended ruleset',
            ],
            body: [...rulesDocRows],
        },
    });

    // Note: Updating Readme is currently a manual dev process
    /* istanbul ignore next */
    if (updateReadmePath) {
        log(`Updating ${updateReadmePath} ..`);
        fs.appendFileSync(updateReadmePath, table);
    }

    return table;
}
