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
            'accesskeys': { priority: 'P3', wcagSC: '2.1.1', wcagLevel: 'A' },
            'aria-text': { priority: 'P3', wcagSC: '4.1.2', wcagLevel: 'A' },
            'blink': { priority: 'P1', wcagSC: '2.2.2', wcagLevel: 'A' },
            'color-contrast-enhanced': { priority: 'P3', wcagSC: '1.4.6', wcagLevel: 'AAA' },
            'css-orientation-lock': { priority: 'P3', wcagSC: '1.3.4', wcagLevel: 'AA' },
            'duplicate-id': { priority: 'P3', wcagSC: '4.1.1', wcagLevel: 'A' },
            'duplicate-id-active': { priority: 'P3', wcagSC: '4.1.1', wcagLevel: 'A' },
            'empty-heading': { priority: 'P3', wcagSC: '1.3.1', wcagLevel: 'A' },
            'empty-table-header': { priority: 'P3', wcagSC: '1.3.1', wcagLevel: 'A' },
            'focus-order-semantics': { priority: 'P3', wcagSC: '', wcagLevel: '' },
            'frame-tested': { priority: 'P3', wcagSC: '', wcagLevel: '' },
            'frame-title-unique': { priority: 'P3', wcagSC: '4.1.2', wcagLevel: 'A' },
            'heading-order': { priority: 'P3', wcagSC: '1.3.1', wcagLevel: 'A' },
            'hidden-content': { priority: 'P3', wcagSC: '', wcagLevel: '' },
            'identical-links-same-purpose': { priority: 'P3', wcagSC: '2.4.9', wcagLevel: 'AAA' },
            'image-redundant-alt': { priority: 'P3', wcagSC: '1.1.1', wcagLevel: 'A' },
            'label-content-name-mismatch': { priority: 'P2', wcagSC: '2.5.3', wcagLevel: 'A' },
            'label-title-only': { priority: 'P3', wcagSC: '3.3.2', wcagLevel: 'A' },
            'landmark-banner-is-top-level': { priority: 'P3', wcagSC: '4.1.1', wcagLevel: 'A' },
            'landmark-complementary-is-top-level': { priority: 'P3', wcagSC: '4.1.1', wcagLevel: 'A' },
            'landmark-contentinfo-is-top-level': { priority: 'P3', wcagSC: '4.1.1', wcagLevel: 'A' },
            'landmark-main-is-top-level': { priority: 'P3', wcagSC: '4.1.1', wcagLevel: 'A' },
            'landmark-no-duplicate-banner': { priority: 'P3', wcagSC: '4.1.1', wcagLevel: 'A' },
            'landmark-no-duplicate-contentinfo': { priority: 'P3', wcagSC: '4.1.1', wcagLevel: 'A' },
            'landmark-no-duplicate-main': { priority: 'P3', wcagSC: '4.1.1', wcagLevel: 'A' },
            'landmark-one-main': { priority: 'P3', wcagSC: '4.1.1', wcagLevel: 'A' },
            'landmark-unique': { priority: 'P3', wcagSC: '4.1.1', wcagLevel: 'A' },
            'link-in-text-block': { priority: 'P2', wcagSC: '1.4.1', wcagLevel: 'A' },
            'meta-refresh-no-exceptions': { priority: 'P3', wcagSC: '', wcagLevel: '' },
            'meta-viewport': { priority: 'P2', wcagSC: '1.4.4', wcagLevel: 'AA' },
            'meta-viewport-large': { priority: 'P2', wcagSC: '1.4.4', wcagLevel: 'AA' },
            'no-autoplay-audio': { priority: 'P1', wcagSC: '1.4.2', wcagLevel: 'A' },
            'page-has-heading-one': { priority: 'P2', wcagSC: '1.3.1', wcagLevel: 'A' },
            'p-as-heading': { priority: 'P2', wcagSC: '1.3.1', wcagLevel: 'A' },
            'region': { priority: 'P3', wcagSC: '1.3.1', wcagLevel: '' },
            'scope-attr-valid': { priority: 'P3', wcagSC: '1.3.1', wcagLevel: 'A' },
            'skip-link': { priority: 'P3', wcagSC: '2.4.1', wcagLevel: '' },
            'tabindex': { priority: 'P3', wcagSC: '2.4.3', wcagLevel: 'A' },
            'table-duplicate-name': { priority: 'P3', wcagSC: '1.3.1', wcagLevel: '' },
            'table-fake-caption': { priority: 'P3', wcagSC: '', wcagLevel: '' },
            'target-size': { priority: 'P2', wcagSC: '2.5.8', wcagLevel: 'AAA' },
            'td-has-header': { priority: 'P1', wcagSC: '1.3.1', wcagLevel: 'A' },
        })
    ) as RuleInfo),
]);

// Contains best-practice rules without an associated WCAG SC and experimental rules
export const extended = getA11yConfig(extendedRulesInfo);
