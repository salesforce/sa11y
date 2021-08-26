/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { defaultPriority, defaultWcagVersion, Priority, WcagLevel, WcagVersion } from './rules';
import { extendedRulesInfo } from './extended';
import { Result } from 'axe-core';

/**
 * Process given tags from a11y violations and extract WCAG meta-data
 * Ref: https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#axe-core-tags
 */
export class WcagMetadata {
    static readonly regExp = /^(wcag)(?<version_or_sc>\d+)(?<level>a*)$/;
    // Default SC for axe rules not strictly associated with a WCAG SC
    //  Could also be experimental rules that are enabled in sa11y preset rules
    static readonly defaultSC = 'best-practice';
    public wcagLevel: WcagLevel = '';
    public wcagVersion: WcagVersion;
    public successCriteria = WcagMetadata.defaultSC;
    public priority: Priority = defaultPriority;

    constructor(readonly violation: Result) {
        const ruleInfo = extendedRulesInfo.get(violation.id);
        if (ruleInfo) {
            // TODO: add tests for codecov
            // rule has metadata provided in preset-rules
            this.wcagVersion = defaultWcagVersion;
            this.wcagLevel = ruleInfo.wcagLevel;
            this.successCriteria = ruleInfo.wcagSC;
            this.priority = ruleInfo.priority;
            return;
        }

        // If rule info metadata doesn't exist (e.g. full ruleset)
        for (const tag of violation.tags.sort()) {
            const match = WcagMetadata.regExp.exec(tag);
            if (!match || !match.groups) continue;
            const level = match.groups.level;
            const versionOrSC = match.groups.version_or_sc.split('').join('.');
            // Tags starting with "wcag" can contain either wcag version and level
            // or success criteria e.g. "wcag2aa", "wcag111"
            if (level) {
                this.wcagLevel = level.toUpperCase() as WcagLevel;
                if (versionOrSC === '2') {
                    this.wcagVersion = '2.0'; // Add decimal for consistency
                } else {
                    this.wcagVersion = versionOrSC as WcagVersion;
                }
            } else {
                this.successCriteria = `${versionOrSC}`;
            }
        }
    }

    /**
     * Return formatted string containing WCAG version, level and SC
     */
    public toString(): string {
        if (!this.wcagVersion || !this.wcagLevel) return this.successCriteria;
        return `WCAG${this.wcagVersion}-Level${this.wcagLevel}-SC${this.successCriteria}-${this.priority}`;
    }
}
