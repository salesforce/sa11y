/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { getA11yConfig, RuleInfo } from './rules';
import { baseRulesInfo } from './base';

export const extendedRulesInfo: RuleInfo = new Map([
    ...baseRulesInfo,
    ...(new Map(
        Object.entries({
            'color-contrast-enhanced': { priority: 'P1', wcagSC: '', wcagLevel: '' },
            'css-orientation-lock': { priority: 'P3', wcagSC: '1.3.4', wcagLevel: 'AA' },
            'focus-order-semantics': { priority: 'P3', wcagSC: '', wcagLevel: '' },
            'frame-tested': { priority: 'P3', wcagSC: '', wcagLevel: '' },
            'frame-title-unique': { priority: 'P3', wcagSC: '', wcagLevel: '' },
            'hidden-content': { priority: 'P3', wcagSC: '', wcagLevel: '' },
            'identical-links-same-purpose': { priority: 'P3', wcagSC: '2.4.9', wcagLevel: 'AAA' },
            'label-content-name-mismatch': { priority: 'P2', wcagSC: '2.5.3', wcagLevel: 'A' },
            'link-in-text-block': { priority: 'P1', wcagSC: '1.4.1', wcagLevel: 'A' },
            'meta-refresh-no-exceptions': { priority: 'P3', wcagSC: '', wcagLevel: '' },
            'no-autoplay-audio': { priority: 'P1', wcagSC: '1.4.2', wcagLevel: 'A' },
            'p-as-heading': { priority: 'P2', wcagSC: '1.3.1', wcagLevel: 'A' },
            'region': { priority: 'P3', wcagSC: '', wcagLevel: '' },
            'skip-link': { priority: 'P3', wcagSC: '', wcagLevel: '' },
            'table-duplicate-name': { priority: 'P3', wcagSC: '', wcagLevel: '' },
            'table-fake-caption': { priority: 'P3', wcagSC: '', wcagLevel: '' },
            'target-size': { priority: 'P1', wcagSC: '', wcagLevel: '' },
            'td-has-header': { priority: 'P1', wcagSC: '1.3.1', wcagLevel: 'A' },
        })
    ) as RuleInfo),
]);

// Contains best-practice rules without an associated WCAG SC and experimental rules
export const extended = getA11yConfig(extendedRulesInfo);
