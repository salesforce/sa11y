/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import 'global-jsdom/lib/register'; // https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#required-globals
import { assertAccessible, axeRuntimeExceptionMsgPrefix } from '../src/assert';
// TODO (Fix): Remove "dist" from import path
import { extended } from '@sa11y/preset-rules/dist/extended';
import { getA11yConfig } from '@sa11y/preset-rules/dist/a11yConfig';

// Customize rules specific to jsdom
const jsdomRules = extended;
jsdomRules.rules = {
    'color-contrast': { enabled: false }, // Disable color-contrast for jsdom
};

beforeAll(() => {
    document.documentElement.lang = 'en'; // required for a11y lang check
});

afterEach(() => {
    document.body.innerHTML = ''; // reset dom body
});

describe('assertAccessible API', () => {
    it('triggers axe runtime exception for non existent rule', async () => {
        const errConfig = getA11yConfig(['non-existent-rule']);
        expect.assertions(2);
        await assertAccessible(document, errConfig).catch((e) => {
            expect(e).toBeDefined();
            expect(e.toString()).toContain(axeRuntimeExceptionMsgPrefix);
        });
    });

    it('throws no errors for dom with no a11y issues', async () => {
        // TODO (cleanup): Move inline html content into test data files
        // From https://github.com/dequelabs/axe-selenium-java/blob/develop/src/test/resources/test-app.js-->
        document.body.innerHTML = `<!doctype html>
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
        expect.assertions(0); // Need at least one expect in a test
        await assertAccessible(document, jsdomRules); // No error thrown
    });

    it('throws an error with a11y issues found for dom with a11y issues', async () => {
        document.body.innerHTML = `<html>
                                    <body>
                                     <a href="#"></a>
                                    </body>
                                   </html>`;
        expect.assertions(3);
        await assertAccessible(document, jsdomRules).catch((e) => {
            expect(e).toBeDefined();
            expect(e.toString()).not.toContain(axeRuntimeExceptionMsgPrefix);
            expect(e).toMatchSnapshot();
        });
    });
});
