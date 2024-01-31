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
            'accesskeys': { priority: 'P3', wcagSC: '4.1.1', wcagLevel: 'A' },
            'aria-text': { priority: 'P3', wcagSC: '4.1.1', wcagLevel: 'A' },
            'color-contrast-enhanced': { priority: 'P3', wcagSC: '1.4.6', wcagLevel: 'AAA' },
            'css-orientation-lock': { priority: 'P3', wcagSC: '1.3.4', wcagLevel: 'AA' },
            'empty-heading': { priority: 'P2', wcagSC: '1.3.1', wcagLevel: 'A' },
            'empty-table-header': { priority: 'P2', wcagSC: '1.3.1', wcagLevel: 'A' },
            'focus-order-semantics': { priority: 'P3', wcagSC: '', wcagLevel: '' },
            'frame-tested': { priority: 'P3', wcagSC: '', wcagLevel: '' },
            'frame-title-unique': { priority: 'P3', wcagSC: '', wcagLevel: '' },
            'heading-order': { priority: 'P2', wcagSC: '1.3.1', wcagLevel: 'A' },
            'hidden-content': { priority: 'P3', wcagSC: '', wcagLevel: '' },
            'identical-links-same-purpose': { priority: 'P3', wcagSC: '2.4.9', wcagLevel: 'AAA' },
            'image-redundant-alt': { priority: 'P3', wcagSC: '1.1.1', wcagLevel: 'A' },
            'label-content-name-mismatch': { priority: 'P2', wcagSC: '2.5.3', wcagLevel: 'A' },
            'landmark-banner-is-top-level': { priority: 'P3', wcagSC: '4.1.1', wcagLevel: 'A' },
            'landmark-complementary-is-top-level': { priority: 'P3', wcagSC: '4.1.1', wcagLevel: 'A' },
            'landmark-contentinfo-is-top-level': { priority: 'P3', wcagSC: '4.1.1', wcagLevel: 'A' },
            'landmark-main-is-top-level': { priority: 'P3', wcagSC: '4.1.1', wcagLevel: 'A' },
            'landmark-no-duplicate-banner': { priority: 'P3', wcagSC: '4.1.1', wcagLevel: 'A' },
            'landmark-no-duplicate-contentinfo': { priority: 'P3', wcagSC: '4.1.1', wcagLevel: 'A' },
            'landmark-no-duplicate-main': { priority: 'P3', wcagSC: '4.1.1', wcagLevel: 'A' },
            'landmark-one-main': { priority: 'P3', wcagSC: '4.1.1', wcagLevel: 'A' },
            'landmark-unique': { priority: 'P3', wcagSC: '4.1.1', wcagLevel: 'A' },
            'link-in-text-block': { priority: 'P1', wcagSC: '1.4.1', wcagLevel: 'A' },
            'meta-refresh-no-exceptions': { priority: 'P3', wcagSC: '', wcagLevel: '' },
            'meta-viewport-large': { priority: 'P2', wcagSC: '1.4.4', wcagLevel: 'AA' },
            'no-autoplay-audio': { priority: 'P1', wcagSC: '1.4.2', wcagLevel: 'A' },
            'page-has-heading-one': { priority: 'P2', wcagSC: '1.3.1', wcagLevel: 'A' },
            'p-as-heading': { priority: 'P2', wcagSC: '1.3.1', wcagLevel: 'A' },
            'region': { priority: 'P3', wcagSC: '', wcagLevel: '' },
            'skip-link': { priority: 'P3', wcagSC: '', wcagLevel: '' },
            'table-duplicate-name': { priority: 'P3', wcagSC: '', wcagLevel: '' },
            'table-fake-caption': { priority: 'P3', wcagSC: '', wcagLevel: '' },
            'target-size': { priority: 'P3', wcagSC: '2.5.5', wcagLevel: 'AAA' },
            'td-has-header': { priority: 'P1', wcagSC: '1.3.1', wcagLevel: 'A' },
        })
    ) as RuleInfo),
]);

// Contains best-practice rules without an associated WCAG SC and experimental rules
export const extended = getA11yConfig(extendedRulesInfo);
