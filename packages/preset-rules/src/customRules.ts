/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as axe from 'axe-core';

export function registerCustomRules(): void {
    axe.configure({
        rules: [
            {
                id: 'h1-no-duplicate',
                selector: 'h1:not([role]), [role=heading][aria-level=1]',
                tags: ['cat.semantics', 'best-practice'],
                metadata: {
                    description: 'Ensures the document has at most one h1 element',
                    help: 'Document must not have more than one h1 element',
                    helpUrl: 'www.helpurl.com',
                },
                all: [],
                any: ['page-no-duplicate-h1'],
                none: [],
            },
        ],
        checks: [
            {
                id: 'page-no-duplicate-h1',
                evaluate: 'page-no-duplicate-evaluate',
                after: 'page-no-duplicate-after',
                options: {
                    selector: 'h1:not([role]), [role=heading][aria-level=1]',
                },
                metadata: {
                    impact: 'moderate',
                    messages: {
                        pass: 'Document does not have more than one h1 element',
                        fail: 'Document has more than one h1 element',
                    },
                },
            },
        ],
    });
}
