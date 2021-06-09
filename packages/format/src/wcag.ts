/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

type WcagLevel = 'A' | 'AA' | 'AAA' | undefined;
type WcagVersion = '2.0' | '2.1' | undefined;

/**
 * Process given tags from a11y violations and extract WCAG meta-data
 * Ref: https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#axe-core-tags
 */
export class WcagMetadata {
    static readonly regExp = /^(wcag)(?<version_or_sc>\d+)(?<level>a*)$/;
    // Default SC for axe rules not strictly associated with a WCAG SC
    //  Could also be experimental rules that are enabled in sa11y preset rules
    static readonly defaultSC = 'best-practice';
    public wcagLevel: WcagLevel;
    public wcagVersion: WcagVersion;
    // TODO (feat): Add support for multiple SC
    public successCriteria = WcagMetadata.defaultSC;

    constructor(readonly tags: string[]) {
        for (const tag of tags) {
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
        return `WCAG${this.wcagVersion}-Level${this.wcagLevel}-SC${this.successCriteria}`;
    }
}
