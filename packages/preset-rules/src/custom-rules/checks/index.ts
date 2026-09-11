/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import axe from 'axe-core';
import { sa11yTextTruncationCheck } from './sa11y-text-truncation-check';
import { sa11yTextSpacingOverflowCheck } from './sa11y-text-spacing-overflow-check';
import { sa11yLabelInNameCheck } from './sa11y-label-in-name-check';

/*
 * axe serializes each check's `evaluate` and re-creates it at test time (including inside child
 * iframes via postMessage), so `evaluate` must be a *string* that starts with `function`. We keep
 * the actual logic in the sibling `*-check.ts` files — real, type-checked, lint-checked, unit-
 * testable functions — and serialize them here with `.toString()`. This is the single place that
 * couples the functions to axe's string contract; the functions themselves stay ordinary code.
 *
 * The metadata (id, options, impact, messages) is preserved verbatim from the previous inline
 * definitions so the emitted rule catalog is unchanged.
 */
const checkData = [
    // ---------------------------------------------------------------------------
    // Existing shipped checks — kept verbatim (evaluate as inline strings) to back
    // the existing `sa11y-Keyboard` / `Resize-reflow-textoverflow` /
    // `sa11y-Keyboard-button` rules for backward compatibility.
    // ---------------------------------------------------------------------------
    {
        id: 'sa11y-Keyboard-check',
        options: ['sa11y-Keyboard-check'],
        evaluate: "function(node, options) { return !!node.hasAttribute('tabindex'); }",
        metadata: {
            impact: 'critical',
            messages: {
                pass: 'Button elements are Keyboard operable',
                fail: "Button elements are not Keyboard operable,To fix add tabindex='0' attribute and  appropriate keyboard event handler.",
            },
        },
    },
    {
        id: 'Resize-reflow-textoverflow-check',
        evaluate:
            "function (node) {const style = window.getComputedStyle(node); const tabIndex = node.getAttribute('tabindex'); if (tabIndex === '-1' && node.actualNode && !isVisibleOnScreen(node) && !isVisibleToScreenReaders(node)) { return false; } if (!node.innerText ===\"\") { return false; } if (style.getPropertyValue('text-overflow') === 'ellipsis') { function isTextTruncated(element) {const isTruncated = (element.scrollWidth > element.clientWidth); return isTruncated; } return !isTextTruncated(node); } if (style.getPropertyValue('display') === '-webkit-box' && style.getPropertyValue('-webkit-line-clamp') != 0 && style.getPropertyValue('overflow') === 'hidden' && style.getPropertyValue('-webkit-box-orient') === 'vertical') { function isTextTruncated(element) { const isTruncated = (element.scrollWidth>element.clientWidth); return isTruncated; } return !isTextTruncated(node); } return true; }",
        metadata: {
            impact: 'moderate',
            messages: {
                pass: 'Text element does not have ellipses ',
                fail: 'Text element have ellipses which make difficulty to read',
            },
        },
    },
    {
        id: 'sa11y-Keyboard-button-check',
        evaluate:
            "function (node) { const tabIndex = node.getAttribute('tabindex'); if ( tabIndex === '-1' && node.actualNode && !isVisibleOnScreen(node) && !isVisibleToScreenReaders(node)) { return false; } if(!node.innerText ===\"\"){ return false; } if(!node.hasAttribute('tabindex')){ return false; } return true; }",
        messages: {
            pass: 'Button element are keyboard operable',
            fail: "Button element are not keyboard operable, To fix add tabindex='0' attribute and appropriate keyboard event handler.",
        },
    },
    // ---------------------------------------------------------------------------
    // New checks added for W-22990841. Logic lives in the sibling `*-check.ts`
    // files and is serialized with `.toString()` (see note above).
    // ---------------------------------------------------------------------------
    {
        id: 'sa11y-text-truncation-check',
        evaluate: sa11yTextTruncationCheck.toString(),
        metadata: {
            impact: 'moderate',
            messages: {
                pass: 'Text element does not have ellipses ',
                fail: 'Text element have ellipses which make difficulty to read',
            },
        },
    },
    {
        id: 'sa11y-text-spacing-overflow-check',
        evaluate: sa11yTextSpacingOverflowCheck.toString(),
        metadata: {
            impact: 'serious',
            messages: {
                pass: 'Content is not clipped when WCAG text spacing is applied',
                fail: 'Content is clipped or overflows when WCAG 1.4.12 text spacing is applied. Ensure no loss of content when word-spacing 0.16em, letter-spacing 0.12em and line-height 1.5 are set.',
            },
        },
    },
    {
        id: 'sa11y-label-in-name-check',
        evaluate: sa11yLabelInNameCheck.toString(),
        metadata: {
            impact: 'serious',
            messages: {
                pass: 'The accessible name contains the visible label text',
                fail: 'The accessible name does not contain the visible label text (WCAG 2.5.3). Speech-input users cannot activate this control by its visible name.',
            },
        },
    },
];

export default checkData as axe.Check[];
