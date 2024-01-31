/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { getA11yConfig, RuleInfo } from './rules';

export const baseRulesInfo: RuleInfo = new Map(
    Object.entries({
        'area-alt': { priority: 'P1', wcagSC: '1.1.1', wcagLevel: 'A' },
        'aria-allowed-attr': { priority: 'P1', wcagSC: '4.1.2', wcagLevel: 'A' },
        'aria-allowed-role': { priority: 'P1', wcagSC: '4.1.2', wcagLevel: 'A' },
        'aria-command-name': { priority: 'P1', wcagSC: '4.1.2', wcagLevel: 'A' },
        'aria-dialog-name': { priority: 'P1', wcagSC: '4.1.2', wcagLevel: 'A' },
        'aria-hidden-body': { priority: 'P1', wcagSC: '4.1.2', wcagLevel: 'A' },
        'aria-hidden-focus': { priority: 'P1', wcagSC: '4.1.2', wcagLevel: 'A' },
        'aria-input-field-name': { priority: 'P1', wcagSC: '4.1.2', wcagLevel: 'A' },
        'aria-meter-name': { priority: 'P1', wcagSC: '4.1.2', wcagLevel: 'A' },
        'aria-progressbar-name': { priority: 'P1', wcagSC: '4.1.2', wcagLevel: 'A' },
        'aria-required-attr': { priority: 'P1', wcagSC: '4.1.2', wcagLevel: 'A' },
        'aria-required-children': { priority: 'P1', wcagSC: '4.1.2', wcagLevel: 'A' },
        'aria-required-parent': { priority: 'P1', wcagSC: '4.1.2', wcagLevel: 'A' },
        'aria-roledescription': { priority: 'P3', wcagSC: '4.1.2', wcagLevel: 'A' },
        'aria-roles': { priority: 'P1', wcagSC: '4.1.2', wcagLevel: 'A' },
        'aria-toggle-field-name': { priority: 'P1', wcagSC: '4.1.2', wcagLevel: 'A' },
        'aria-tooltip-name': { priority: 'P1', wcagSC: '4.1.2', wcagLevel: 'A' },
        'aria-treeitem-name': { priority: 'P1', wcagSC: '4.1.2', wcagLevel: 'A' },
        'aria-valid-attr': { priority: 'P3', wcagSC: '4.1.2', wcagLevel: 'A' },
        'aria-valid-attr-value': { priority: 'P3', wcagSC: '4.1.2', wcagLevel: 'A' },
        'audio-caption': { priority: 'P1', wcagSC: '1.2.2', wcagLevel: 'A' },
        'autocomplete-valid': { priority: 'P2', wcagSC: '1.3.5', wcagLevel: 'AA' },
        'avoid-inline-spacing': { priority: 'P3', wcagSC: '1.4.12', wcagLevel: 'AA' },
        'blink': { priority: 'P1', wcagSC: '2.2.2', wcagLevel: 'A' },
        'button-name': { priority: 'P1', wcagSC: '4.1.2', wcagLevel: 'A' },
        'bypass': { priority: 'P3', wcagSC: '2.4.1', wcagLevel: 'A' },
        'color-contrast': { priority: 'P1', wcagSC: '1.4.3', wcagLevel: 'AA' },
        'definition-list': { priority: 'P2', wcagSC: '1.3.1', wcagLevel: 'A' },
        'dlitem': { priority: 'P2', wcagSC: '1.3.1', wcagLevel: 'A' },
        'document-title': { priority: 'P2', wcagSC: '2.4.2', wcagLevel: 'A' },
        'duplicate-id': { priority: 'P3', wcagSC: '4.1.1', wcagLevel: 'A' },
        'duplicate-id-active': { priority: 'P3', wcagSC: '4.1.1', wcagLevel: 'A' },
        'duplicate-id-aria': { priority: 'P1', wcagSC: '4.1.2', wcagLevel: 'A' },
        'form-field-multiple-labels': { priority: 'P2', wcagSC: '2.5.3', wcagLevel: 'A' },
        'frame-focusable-content': { priority: 'P1', wcagSC: '2.1.1', wcagLevel: 'A' },
        'frame-title': { priority: 'P3', wcagSC: '2.4.2', wcagLevel: 'A' },
        'html-has-lang': { priority: 'P2', wcagSC: '3.1.1', wcagLevel: 'A' },
        'html-lang-valid': { priority: 'P2', wcagSC: '3.1.1', wcagLevel: 'A' },
        'html-xml-lang-mismatch': { priority: 'P2', wcagSC: '3.1.1', wcagLevel: 'A' },
        'image-alt': { priority: 'P1', wcagSC: '1.1.1', wcagLevel: 'A' },
        'input-button-name': { priority: 'P1', wcagSC: '4.1.2', wcagLevel: 'A' },
        'input-image-alt': { priority: 'P1', wcagSC: '1.1.1', wcagLevel: 'A' },
        'label': { priority: 'P1', wcagSC: '3.3.2', wcagLevel: 'A' },
        'label-title-only': { priority: 'P1', wcagSC: '3.3.2', wcagLevel: 'A' },
        'link-name': { priority: 'P1', wcagSC: '4.1.2', wcagLevel: 'A' },
        'list': { priority: 'P2', wcagSC: '1.3.1', wcagLevel: 'A' },
        'listitem': { priority: 'P2', wcagSC: '1.3.1', wcagLevel: 'A' },
        'marquee': { priority: 'P1', wcagSC: '2.2.2', wcagLevel: 'A' },
        'meta-refresh': { priority: 'P1', wcagSC: '2.2.1', wcagLevel: 'A' },
        'meta-viewport': { priority: 'P2', wcagSC: '1.4.4', wcagLevel: 'AA' },
        'nested-interactive': { priority: 'P1', wcagSC: '4.1.2', wcagLevel: 'A' },
        'object-alt': { priority: 'P1', wcagSC: '1.1.1', wcagLevel: 'A' },
        'presentation-role-conflict': { priority: 'P3', wcagSC: '4.1.1', wcagLevel: 'A' },
        'role-img-alt': { priority: 'P1', wcagSC: '1.1.1', wcagLevel: 'A' },
        'scope-attr-valid': { priority: 'P1', wcagSC: '1.3.1', wcagLevel: 'A' },
        'scrollable-region-focusable': { priority: 'P1', wcagSC: '2.1.1', wcagLevel: 'A' },
        'select-name': { priority: 'P1', wcagSC: '4.1.2', wcagLevel: 'A' },
        'server-side-image-map': { priority: 'P1', wcagSC: '2.1.1', wcagLevel: 'A' },
        'svg-img-alt': { priority: 'P1', wcagSC: '1.1.1', wcagLevel: 'A' },
        'tabindex': { priority: 'P2', wcagSC: '2.4.3', wcagLevel: 'A' },
        'td-headers-attr': { priority: 'P1', wcagSC: '1.3.1', wcagLevel: 'A' },
        'th-has-data-cells': { priority: 'P1', wcagSC: '1.3.1', wcagLevel: 'A' },
        'valid-lang': { priority: 'P2', wcagSC: '3.1.1', wcagLevel: 'A' },
        'video-caption': { priority: 'P1', wcagSC: '1.2.2', wcagLevel: 'A' },
    })
);

export const base = getA11yConfig(baseRulesInfo);
