/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { A11yConfig, log } from '@sa11y/common';

export type WcagVersion = '2.0' | '2.1' | undefined;
export const wcagLevels = ['A', 'AA', 'AAA', ''];
export type WcagLevel = (typeof wcagLevels)[number];
export const priorities = ['P1', 'P2', 'P3', ''] as const;
export type Priority = (typeof priorities)[number];
export const defaultPriority: Priority = 'P3';
export const defaultWcagVersion: WcagVersion = '2.1';

/**
 * Metadata about rules such as Priority and WCAG SC (overriding values from axe tags)
 */
export type RuleMetadata = {
    priority: Priority;
    wcagSC: string;
    wcagLevel: WcagLevel;
};

/**
 * Map of rule IDs to RuleMetadata for convenient lookups of metadata based on rule id
 */
export type RuleInfo = Map<
    string, // Rule ID
    RuleMetadata
>;

/**
 * Get Priority filter for the default ruleset.
 * When set, only the rules matching the given priority from the default ruleset will be
 * used for the sa11y API and automatic checks.
 */
export function getPriorityFilter(): Priority {
    const priorityEnv = process.env.SA11Y_RULESET_PRIORITY;
    const priority = priorityEnv && priorities.includes(priorityEnv as Priority) ? (priorityEnv as Priority) : '';
    if (priority) log(`Setting Sa11y rules priority to ${priority}`);
    return priority;
}

/**
 * Filter given rules and return those matching given priority or .
 */
export function filterRulesByPriority(rules: RuleInfo, priority: Priority = ''): string[] {
    // TODO (refactor): Could be simplified by filtering and returning a RuleInfo map
    //  and using the rule keys in the calling function
    const ruleIDs: string[] = [];
    const priorityOverride = priority || getPriorityFilter();
    if (!priorityOverride) {
        // if no override is set, return all rules
        ruleIDs.push(...rules.keys());
    } else {
        for (const [ruleID, ruleInfo] of rules.entries()) {
            if (priorityOverride === ruleInfo.priority) ruleIDs.push(ruleID);
        }
    }
    return ruleIDs.sort();
}

/**
 * Returns config to be used in axe.run() with given rules
 * Ref: https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#options-parameter
 * @param rules - List of rules to be used in the config
 * @returns A11yConfig with formatted rules
 */
export function getA11yConfig(rules: RuleInfo): A11yConfig {
    // Note: Making the returned config immutable using Object.freeze() results in
    //  "TypeError: Cannot add property reporter, object is not extensible"
    //  even when no local modifications are made. axe.run() itself seems to be modifying the config object.

    return {
        runOnly: {
            type: 'rule',
            values: filterRulesByPriority(rules),
        },
        // Disable preloading assets as it causes timeouts for audio/video elements
        //  with jest and delays webdriver tests by 2-3x when assets are not found (404)
        //  Ref: https://github.com/dequelabs/axe-core/issues/2528
        preload: false,
        // Types not listed will still show a maximum of one node
        resultTypes: ['violations'],
        reporter: 'no-passes', // return only violation results
    };
}
