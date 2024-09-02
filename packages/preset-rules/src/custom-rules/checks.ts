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
        id: 'Resize-reflow-textoverflow-check',
        evaluate:
            "function (node) {const style = window.getComputedStyle(node); const tabIndex = node.getAttribute('tabindex'); if (tabIndex === '-1' && node.actualNode && !isVisibleOnScreen(node) && !isVisibleToScreenReaders(node)) { return false; } if (node.innerText === '') { return false; } if (style.getPropertyValue('text-overflow') === 'ellipsis') { function isTextTruncated(element) {const isTruncated = (element.scrollWidth > element.clientWidth); return isTruncated; } return !isTextTruncated(node); } return true; }",
        metadata: {
            impact: 'moderate',
            messages: {
                pass: 'Text element does not have ellipses ',
                fail: 'Text element have ellipses which make difficulty to read',
            },
        },
    },
];

export default checkData as axe.Check[];
