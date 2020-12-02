/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { getA11yConfig } from './a11yConfig';
import { base } from './base';

const rules = [
    ...base.runOnly.values,
    'accesskeys',
    'aria-allowed-role',
    'aria-dialog-name',
    'aria-meter-name',
    'aria-progressbar-name',
    'avoid-inline-spacing',
    'css-orientation-lock',
    'frame-tested',
    'identical-links-same-purpose',
    'label-content-name-mismatch',
    'landmark-banner-is-top-level',
    'landmark-complementary-is-top-level',
    'landmark-contentinfo-is-top-level',
    'landmark-main-is-top-level',
    'landmark-no-duplicate-banner',
    'landmark-no-duplicate-contentinfo',
    'landmark-no-duplicate-main',
    'landmark-one-main',
    'landmark-unique',
    'link-in-text-block',
    'meta-viewport',
    'meta-viewport-large',
    'no-autoplay-audio',
    'object-alt',
    'p-as-heading',
    'presentation-role-conflict',
    'region',
];

export const recommended = getA11yConfig(rules);
