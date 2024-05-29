/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
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
];

export default checkData;
