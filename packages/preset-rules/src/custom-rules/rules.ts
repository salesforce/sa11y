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
    {
        // SC 1.4.12 Text Spacing (AA).
        // Injects the WCAG text-spacing overrides on the element and flags it when the
        // content starts to overflow / clip (scrollWidth > clientWidth or scrollHeight > clientHeight)
        // that was not overflowing before the override. Salesforce ecosystem-specific detection
        // agreed with Subrahmanyam Putta (see .eclipse/custom-rules.md).
        id: 'sa11y-text-spacing-overflow',
        selector: 'p,span,a,button,li,td,th,dd,dt,h1,h2,h3,h4,h5,h6,label,legend,figcaption,summary,div',
        enabled: true,
        any: ['sa11y-text-spacing-overflow-check'],
        all: [],
        none: [],
        metadata: {
            description: 'Content is clipped or overflows when WCAG 1.4.12 text spacing is applied.',
            help: 'Ensure no loss of content or functionality when text spacing (word-spacing 0.16em, letter-spacing 0.12em, line-height 1.5) is applied.',
            helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/text-spacing.html',
            impact: 'serious',
            tags: ['wcag1412', 'wcag21aa', 'custom'],
        },
    },
    {
        // SC 2.5.3 Label in Name (A).
        // Enhancement over axe's label-content-name-mismatch: flags interactive elements whose
        // accessible name (aria-label / aria-labelledby) does not contain their visible text label.
        // Targets the combobox / complex-labeling gap called out in .eclipse/custom-rules.md.
        id: 'sa11y-label-in-name',
        selector:
            "button,a[href],[role='button'],[role='link'],[role='menuitem'],[role='tab'],[role='option'],[role='checkbox'],[role='radio'],[role='switch'],[role='combobox'],[role='menuitemcheckbox'],[role='menuitemradio'],[role='treeitem']",
        enabled: true,
        any: ['sa11y-label-in-name-check'],
        all: [],
        none: [],
        metadata: {
            description: 'The accessible name does not contain the visible label text.',
            help: 'Ensure the accessible name (aria-label/aria-labelledby) contains the visible label text so speech-input users can activate the control by its visible name.',
            helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/label-in-name.html',
            impact: 'serious',
            tags: ['wcag253', 'wcag21a', 'custom'],
        },
    },
];

export default rulesData as axe.Rule[];
