/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import 'global-jsdom/lib/register'; // https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#required-globals
import { matcherHintMsg, toBeAccessible } from '../src/jest';
import { extended, recommended } from '@sa11y/preset-rules';

// TODO (Fix): Error when using "await" with "toBeAccessible": "Unexpected await of a non-Promise (non-"Thenable") value"
//  Needs to be fixed before release as it would affect usability of the API for users.
/* eslint-disable @typescript-eslint/await-thenable */

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
    document.documentElement.lang = 'en'; // required for a11y lang check
});

afterEach(() => {
    document.body.innerHTML = ''; // reset dom body
});

describe('toBeAccessible Jest a11y matcher', function () {
    it.each([document, undefined])('should not throw error for dom with no a11y issues (Dom arg: %#)', async (dom) => {
        document.body.innerHTML = domWithNoA11yIssues;
        await expect(dom).toBeAccessible();
    });

    it.each([extended, recommended, undefined])(
        'should throw error for dom with a11y issues with config: %#',
        async (config) => {
            document.body.innerHTML = domWithA11yIssues;
            // using the 'not' matcher just for testing, not expecting this to be used out of here
            await expect(document).not.toBeAccessible(config);
            // using without the 'not' matcher which should be the primary way the API is used (without error catching)
            try {
                await expect(document).toBeAccessible(config);
            } catch (e) {
                expect(e.message).toContain(matcherHintMsg);
            }
        }
    );
});
