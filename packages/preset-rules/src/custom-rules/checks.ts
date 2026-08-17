/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import axe from 'axe-core';
const checkData = [
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
        // SC 1.4.10 Reflow — flag text that is truncated with an ellipsis (or -webkit-line-clamp)
        // and is actually clipped (scrollWidth > clientWidth). Returning false marks a violation.
        // Rewritten from the original: the original guard `if (!node.innerText === "")` always
        // evaluated to `false === ""` (never true) so the empty-text short-circuit never ran, and
        // the `-webkit-line-clamp != 0` compared a CSS string against a number.
        id: 'Resize-reflow-textoverflow-check',
        evaluate:
            "function (node) { if (!node) { return true; } var win = (node.ownerDocument && node.ownerDocument.defaultView) || window; var style = win.getComputedStyle(node); var tabIndex = node.getAttribute('tabindex'); if (tabIndex === '-1' && node.actualNode && !isVisibleOnScreen(node) && !isVisibleToScreenReaders(node)) { return true; } if ((node.innerText || '').trim() === '') { return true; } function isTextTruncated(element) { return element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight; } if (style.getPropertyValue('text-overflow') === 'ellipsis') { return !isTextTruncated(node); } var clamp = style.getPropertyValue('-webkit-line-clamp'); if (style.getPropertyValue('display') === '-webkit-box' && clamp && clamp !== 'none' && clamp !== '0' && style.getPropertyValue('overflow') === 'hidden' && style.getPropertyValue('-webkit-box-orient') === 'vertical') { return !isTextTruncated(node); } return true; }",
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
    {
        // SC 1.4.12 Text Spacing — inject the WCAG text-spacing overrides on the element, force a
        // reflow, and flag (return false) only when the spacing newly clips/overflows the content
        // (scrollWidth > clientWidth or scrollHeight > clientHeight) that was NOT overflowing before.
        // Comparing before vs after avoids false positives from containers that already scroll.
        // Inline styles are saved and restored so the DOM is left unchanged after the check.
        id: 'sa11y-text-spacing-overflow-check',
        evaluate:
            "function (node) { if (!node || !node.style) { return true; } if ((node.textContent || '').trim() === '') { return true; } var win = (node.ownerDocument && node.ownerDocument.defaultView) || window; var style = win.getComputedStyle(node); if (style.getPropertyValue('display') === 'none' || style.getPropertyValue('visibility') === 'hidden') { return true; } var beforeX = node.scrollWidth > node.clientWidth; var beforeY = node.scrollHeight > node.clientHeight; var saved = { ws: node.style.getPropertyValue('word-spacing'), wsP: node.style.getPropertyPriority('word-spacing'), ls: node.style.getPropertyValue('letter-spacing'), lsP: node.style.getPropertyPriority('letter-spacing'), lh: node.style.getPropertyValue('line-height'), lhP: node.style.getPropertyPriority('line-height') }; node.style.setProperty('word-spacing', '0.16em', 'important'); node.style.setProperty('letter-spacing', '0.12em', 'important'); node.style.setProperty('line-height', '1.5', 'important'); void node.offsetHeight; var afterX = node.scrollWidth > node.clientWidth; var afterY = node.scrollHeight > node.clientHeight; node.style.removeProperty('word-spacing'); node.style.removeProperty('letter-spacing'); node.style.removeProperty('line-height'); if (saved.ws) { node.style.setProperty('word-spacing', saved.ws, saved.wsP); } if (saved.ls) { node.style.setProperty('letter-spacing', saved.ls, saved.lsP); } if (saved.lh) { node.style.setProperty('line-height', saved.lh, saved.lhP); } var newlyClipped = (afterX && !beforeX) || (afterY && !beforeY); return !newlyClipped; }",
        metadata: {
            impact: 'serious',
            messages: {
                pass: 'Content is not clipped when WCAG text spacing is applied',
                fail: 'Content is clipped or overflows when WCAG 1.4.12 text spacing is applied. Ensure no loss of content when word-spacing 0.16em, letter-spacing 0.12em and line-height 1.5 are set.',
            },
        },
    },
    {
        // SC 2.5.3 Label in Name — the accessible name (aria-label / aria-labelledby) must contain
        // the visible label text. Only elements with an explicit aria-label(ledby) are checked; when
        // the accessible name is derived from content it matches by definition. Enhancement over
        // axe label-content-name-mismatch to cover comboboxes and complex-labeling patterns.
        id: 'sa11y-label-in-name-check',
        evaluate:
            "function (node) { if (!node) { return true; } var norm = function (s) { return (s || '').replace(/[\\u2018\\u2019\\u201C\\u201D]/g, \"'\").replace(/[.,:;!?()\\[\\]{}\\\"'`|]/g, '').replace(/\\s+/g, ' ').trim().toLowerCase(); }; var visible = norm(node.textContent); if (visible === '') { return true; } var doc = node.ownerDocument; var accName = ''; if (node.hasAttribute('aria-labelledby')) { var ids = node.getAttribute('aria-labelledby').split(/\\s+/); var parts = []; for (var i = 0; i < ids.length; i++) { var el = doc.getElementById(ids[i]); if (el) { parts.push(el.textContent || ''); } } accName = parts.join(' '); } else if (node.hasAttribute('aria-label')) { accName = node.getAttribute('aria-label'); } else { return true; } accName = norm(accName); if (accName === '') { return true; } return accName.indexOf(visible) !== -1; }",
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
