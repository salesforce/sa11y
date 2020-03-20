/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { recommended } from './recommended';

export const extended = {
    // TODO (refactor): Inherit from recommended and deduplicate
    ...recommended,
    runOnly: {
        ...recommended.runOnly,
        values: [
            ...recommended.runOnly.values,
            'accesskeys',
            'aria-allowed-role',
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
            'meta-viewport-large',
            'meta-viewport',
            'no-autoplay-audio',
            'object-alt',
            'p-as-heading',
            'region',
        ],
    },
};
