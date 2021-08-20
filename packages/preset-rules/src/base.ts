/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { getA11yConfig, RuleInfo } from './a11yConfig';

export const baseRulesInfo: RuleInfo = new Map(
    Object.entries({
        'area-alt': { priority: 'P3', wcagSC: '' },
        'aria-allowed-attr': { priority: 'P3', wcagSC: '' },
        'aria-command-name': { priority: 'P3', wcagSC: '' },
        'aria-hidden-body': { priority: 'P3', wcagSC: '' },
        'aria-hidden-focus': { priority: 'P3', wcagSC: '' },
        'aria-input-field-name': { priority: 'P3', wcagSC: '' },
        'aria-required-attr': { priority: 'P3', wcagSC: '' },
        'aria-required-children': { priority: 'P3', wcagSC: '' },
        'aria-required-parent': { priority: 'P3', wcagSC: '' },
        'aria-roledescription': { priority: 'P3', wcagSC: '' },
        'aria-roles': { priority: 'P3', wcagSC: '' },
        'aria-toggle-field-name': { priority: 'P3', wcagSC: '' },
        'aria-tooltip-name': { priority: 'P3', wcagSC: '' },
        'aria-treeitem-name': { priority: 'P3', wcagSC: '' },
        'aria-valid-attr': { priority: 'P3', wcagSC: '' },
        'aria-valid-attr-value': { priority: 'P3', wcagSC: '' },
        'audio-caption': { priority: 'P3', wcagSC: '' },
        'autocomplete-valid': { priority: 'P3', wcagSC: '' },
        blink: { priority: 'P3', wcagSC: '' },
        'button-name': { priority: 'P3', wcagSC: '' },
        bypass: { priority: 'P3', wcagSC: '' },
        'color-contrast': { priority: 'P3', wcagSC: '' },
        'definition-list': { priority: 'P3', wcagSC: '' },
        dlitem: { priority: 'P3', wcagSC: '' },
        'document-title': { priority: 'P3', wcagSC: '' },
        'duplicate-id': { priority: 'P3', wcagSC: '' },
        'duplicate-id-active': { priority: 'P3', wcagSC: '' },
        'duplicate-id-aria': { priority: 'P3', wcagSC: '' },
        'empty-heading': { priority: 'P3', wcagSC: '' },
        'focus-order-semantics': { priority: 'P3', wcagSC: '' },
        'form-field-multiple-labels': { priority: 'P3', wcagSC: '' },
        'frame-title': { priority: 'P3', wcagSC: '' },
        'heading-order': { priority: 'P3', wcagSC: '' },
        'html-has-lang': { priority: 'P3', wcagSC: '' },
        'html-lang-valid': { priority: 'P3', wcagSC: '' },
        'html-xml-lang-mismatch': { priority: 'P3', wcagSC: '' },
        'image-alt': { priority: 'P3', wcagSC: '' },
        'image-redundant-alt': { priority: 'P3', wcagSC: '' },
        'input-button-name': { priority: 'P3', wcagSC: '' },
        'input-image-alt': { priority: 'P3', wcagSC: '' },
        label: { priority: 'P3', wcagSC: '' },
        'label-title-only': { priority: 'P3', wcagSC: '' },
        'link-name': { priority: 'P3', wcagSC: '' },
        list: { priority: 'P3', wcagSC: '' },
        listitem: { priority: 'P3', wcagSC: '' },
        marquee: { priority: 'P3', wcagSC: '' },
        'meta-refresh': { priority: 'P3', wcagSC: '' },
        'page-has-heading-one': { priority: 'P3', wcagSC: '' },
        'role-img-alt': { priority: 'P3', wcagSC: '' },
        'scope-attr-valid': { priority: 'P3', wcagSC: '' },
        'scrollable-region-focusable': { priority: 'P3', wcagSC: '' },
        'select-name': { priority: 'P3', wcagSC: '' },
        'server-side-image-map': { priority: 'P3', wcagSC: '' },
        'svg-img-alt': { priority: 'P3', wcagSC: '' },
        tabindex: { priority: 'P3', wcagSC: '' },
        'td-has-header': { priority: 'P3', wcagSC: '' },
        'td-headers-attr': { priority: 'P3', wcagSC: '' },
        'th-has-data-cells': { priority: 'P3', wcagSC: '' },
        'valid-lang': { priority: 'P3', wcagSC: '' },
        'video-caption': { priority: 'P3', wcagSC: '' },
    })
);

export const base = getA11yConfig(baseRulesInfo);
