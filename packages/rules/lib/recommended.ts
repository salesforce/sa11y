/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { getAxeConfig } from './axeConfig';

const rules = [
    'area-alt',
    'aria-allowed-attr',
    'aria-hidden-body',
    'aria-hidden-focus',
    'aria-input-field-name',
    'aria-required-attr',
    'aria-required-children',
    'aria-required-parent',
    'aria-roledescription',
    'aria-roles',
    'aria-toggle-field-name',
    'aria-valid-attr-value',
    'aria-valid-attr',
    'audio-caption',
    'autocomplete-valid',
    'blink',
    'button-name',
    'bypass',
    'color-contrast',
    'definition-list',
    'dlitem',
    'document-title',
    'duplicate-id-active',
    'duplicate-id-aria',
    'duplicate-id',
    'empty-heading',
    'focus-order-semantics',
    'form-field-multiple-labels',
    'frame-title',
    'heading-order',
    'html-has-lang',
    'html-lang-valid',
    'html-xml-lang-mismatch',
    'image-alt',
    'image-redundant-alt',
    'input-button-name',
    'input-image-alt',
    'label-title-only',
    'label',
    'link-name',
    'list',
    'listitem',
    'marquee',
    'meta-refresh',
    'page-has-heading-one',
    'role-img-alt',
    'scope-attr-valid',
    'scrollable-region-focusable',
    'server-side-image-map',
    'svg-img-alt',
    'tabindex',
    'td-has-header',
    'td-headers-attr',
    'th-has-data-cells',
    'valid-lang',
    'video-caption',
];

export const recommended = getAxeConfig(rules);
