/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import axe from 'axe-core';
const rulesData = [
    {
        id: 'sa11y-Keyboard',
        metadata: {
            description: 'Element is not keyboard operable',
            help: "The following button element <strong>'+ ele.innerText+ '</strong> missing keyboard operability. To fix add tabindex='0' attribute and  appropriate keyboard event handler.",
            helpUrl: '',
        },
        selector:
            "[role='button']:not(a[href],button,input,select,area[href],textarea,[contentEditable=true],[disabled],details)",
        any: [],
        all: ['sa11y-Keyboard-check'],
        none: [],
        tags: ['wcag22aa', 'wcag211'],
    },
    {
        id: 'Resize-reflow-textoverflow',
        selector: '*',
        enabled: true,
        any: ['Resize-reflow-textoverflow-check'],
        all: [],
        metadata: {
            description: 'Ensure Ellipses are not present as text is truncated.',
            help: 'Text elements do not have ellipsis as text is truncated.',
            helpUrl: 'https://example.com/custom-rule-help',
            impact: 'moderate',
            tags: ['wcag1410', 'custom'],
        },
    },
    {
        id: 'sa11y-Keyboard-button',
        selector:
            "[role='button']:not(a[href],button,input,select,area[href],textarea,[contentEditable=true],[disabled],details)",
        enabled: true,
        any: ['sa11y-Keyboard-button-check'],
        all: [],
        metadata: {
            description: 'Element is not keyboard operable',
            help: "Fix any one of the following :\n \
                       1.The button element missing keyboard operability. To fix add tabindex='0' attribute and  appropriate keyboard event handler.\n \
                       2.Remove role='button' attribute",
            helpUrl: '',

            impact: 'critical',
            tags: ['wcag211', 'custom'],
        },
    },
];

export default rulesData as axe.Rule[];
