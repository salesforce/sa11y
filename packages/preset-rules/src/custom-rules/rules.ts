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
];

export default rulesData as axe.Rule[];
