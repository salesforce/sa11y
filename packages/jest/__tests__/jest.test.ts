/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import 'global-jsdom/lib/register'; // https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#required-globals
import { toBeAccessible } from '../src/jest';
import { extended, recommended } from '@sa11y/preset-rules';

// TODO (de-duplicate): Extract into a common place and reuse across packages
const domWithA11yIssues = `<html>
                            <body>
                             <a href="#"></a>
                            </body>
                           </html>`;

// From https://github.com/dequelabs/axe-selenium-java/blob/develop/src/test/resources/test-app.js-->
const domWithNoA11yIssues = `<!doctype html>
                            <html lang="en">
                            <head>
                                <title>Test Page</title>
                            </head>
                            <body>
                            <div role="main" id="host">
                                <h1>This is a test</h1>
                                <p>This is a test page with no violations</p>
                            </div>
                            <div role="contentinfo" id="upside-down"></div> <!-- cSpell:disable-line -->
                                <script>
                                    var shadow = document.getElementById("upside-down").attachShadow({mode: "open"});
                                    shadow.innerHTML = '<h2 id="shadow">SHADOW DOM</h2><ul><li>Shadow Item 1</li></ul>'
                                </script>
                            </body>
                            </html>`;

beforeAll(() => {
    expect.extend({ toBeAccessible });
});

afterEach(() => {
    document.body.innerHTML = ''; // reset dom body
});

describe('toBeAccessible Jest API', function () {
    // TODO (refactor): Sep basic functionality into their own tests from testing default args
    //  Use https://github.com/dankogai/js-combinatorics
    document.body.innerHTML = domWithA11yIssues;
    it.each([document, undefined])('throws no error for dom with no a11y issues: %#', (dom) => {
        expect(dom).toBeAccessible();
    });

    it.each([extended, recommended, undefined])(
        'toBeAccessible throws error for dom with a11y issues with config: %#',
        (config) => {
            expect(domWithA11yIssues).toBeAccessible(config);
        }
    );
});
