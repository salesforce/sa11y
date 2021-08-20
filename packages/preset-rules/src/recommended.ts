/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { getA11yConfig, RuleInfo } from './rules';
import { baseRulesInfo } from './base';

export const recommendedRulesInfo: RuleInfo = new Map([
    ...baseRulesInfo,
    ...(new Map(
        Object.entries({
            accesskeys: { priority: 'P3', wcagSC: '' },
            'aria-allowed-role': { priority: 'P3', wcagSC: '' },
            'aria-dialog-name': { priority: 'P3', wcagSC: '' },
            'aria-meter-name': { priority: 'P3', wcagSC: '' },
            'aria-progressbar-name': { priority: 'P3', wcagSC: '' },
            'avoid-inline-spacing': { priority: 'P3', wcagSC: '' },
            'css-orientation-lock': { priority: 'P3', wcagSC: '' },
            'frame-tested': { priority: 'P3', wcagSC: '' },
            'identical-links-same-purpose': { priority: 'P3', wcagSC: '' },
            'label-content-name-mismatch': { priority: 'P3', wcagSC: '' },
            'landmark-banner-is-top-level': { priority: 'P3', wcagSC: '' },
            'landmark-complementary-is-top-level': { priority: 'P3', wcagSC: '' },
            'landmark-contentinfo-is-top-level': { priority: 'P3', wcagSC: '' },
            'landmark-main-is-top-level': { priority: 'P3', wcagSC: '' },
            'landmark-no-duplicate-banner': { priority: 'P3', wcagSC: '' },
            'landmark-no-duplicate-contentinfo': { priority: 'P3', wcagSC: '' },
            'landmark-no-duplicate-main': { priority: 'P3', wcagSC: '' },
            'landmark-one-main': { priority: 'P3', wcagSC: '' },
            'landmark-unique': { priority: 'P3', wcagSC: '' },
            'link-in-text-block': { priority: 'P3', wcagSC: '' },
            'meta-viewport': { priority: 'P3', wcagSC: '' },
            'meta-viewport-large': { priority: 'P3', wcagSC: '' },
            'no-autoplay-audio': { priority: 'P3', wcagSC: '' },
            'object-alt': { priority: 'P3', wcagSC: '' },
            'p-as-heading': { priority: 'P3', wcagSC: '' },
            'presentation-role-conflict': { priority: 'P3', wcagSC: '' },
            region: { priority: 'P3', wcagSC: '' },
        })
    ) as RuleInfo),
]);

export const recommended = getA11yConfig(recommendedRulesInfo);
