/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

type WcagLevel = 'A' | 'AA' | 'AAA' | undefined;
type WcagVersion = '2.0' | '2.1' | undefined;

/**
 * Process given tags from a11y violations and return WCAG meta-data
 * Ref: https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#axe-core-tags
 */
export class WcagMetadata {
    static readonly regExp = /^(wcag)(?<version_or_sc>\d+)(?<level>a*)$/;
    static readonly defaultSC = 'best-practice';
    public wcagLevel: WcagLevel;
    public wcagVersion: WcagVersion;
    public successCriteria = WcagMetadata.defaultSC; // Default SC for non-wcag rules
    constructor(readonly tags: string[]) {
        tags.forEach((tag) => {
            const match = WcagMetadata.regExp.exec(tag);
            if (match && match.groups) {
                const level = match.groups.level;
                // Tags starting with "wcag" can contain either wcag version and level
                // or success criteria
                if (level) {
                    this.wcagLevel = level.toUpperCase() as WcagLevel;
                    if (match.groups.version_or_sc === '2') {
                        this.wcagVersion = '2.0'; // Add decimal for consistency
                    } else {
                        this.wcagVersion = match.groups.version_or_sc.split('').join('.') as WcagVersion;
                    }
                } else {
                    this.successCriteria = match.groups.version_or_sc.split('').join('.');
                }
            }
        });
    }

    /**
     * Return formatted string containing WCAG version, level and SC
     */
    toString(): string {
        if (!this.wcagVersion || !this.wcagLevel) {
            throw new Error(`Unable to set WCAG version and level from given tags: ${this.tags.join(', ')}`);
        }
        return `WCAG-${this.wcagVersion}-Level-${this.wcagLevel} SC-${this.successCriteria}`;
    }
}
