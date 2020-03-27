/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import 'global-jsdom/lib/register'; // https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#required-globals
import { assertAccessible, runAxe } from '../src/assert';
import { extended } from '@sa11y/preset-rules/dist/extended';

// Customize rules specific to jsdom
const jsdomRules = extended;
jsdomRules.rules = {
    'color-contrast': { enabled: false }, // Disable color-contrast for jsdom
};

/**
 * Setup JSDOM for axe with given string html content and return document object
 * Ref:
 *  - https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#required-globals
 *  - https://github.com/dequelabs/axe-core/blob/develop/doc/examples/jsdom/test/a11y.js
 * @param htmlContent - string HTML content to be rendered using JSDOM
 */
function setupJSDOM(htmlContent: string, lang: string = 'en'): Document {
    // const jsdom = new JSDOM(htmlContent);
    // const window = jsdom.window;

    document.documentElement.lang = 'en';
    document.body.innerHTML = htmlContent;
    // TODO (Warn): Fix type warnings related to "global". E.g. https://stackoverflow.com/a/54281738
    // global.window = window;
    // // needed by axios lib/helpers/isURLSameOrigin.js
    // global.navigator = window.navigator;
    //
    // // needed by axe /lib/core/public/run.js
    // global.Node = window.Node;
    // global.NodeList = window.NodeList;
    //
    // // needed by axe /lib/core/base/context.js
    // global.Element = window.Element;
    // global.Document = window.Document;

    // return window.document;
    return document;
}

describe('assert', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    it('dom with no a11y issues', async () => {
        // const jsdom = setupJSDOM(`<!DOCTYPE html><p>Hello world</p>`);
        // TODO (cleanup): Move inline html content into test data files
        // From https://github.com/dequelabs/axe-selenium-java/blob/develop/src/test/resources/test-app.js-->
        const dom = setupJSDOM(`<!doctype html>
                                    <html lang="en">
                                    <head>
                                        <title>Test Page</title>
                                    </head>
                                    <body>
                                    <div role="main" id="host">
                                        <h1>This is a test</h1>
                                        <p>This is a test page with no violations</p>
                                    </div>
                                    <div role="contentinfo" id="upside-down"></div>
                                        <script>
                                            var shadow = document.getElementById("upside-down").attachShadow({mode: "open"});
                                            shadow.innerHTML = '<h2 id="shadow">SHADOW DOM</h2><ul><li>Shadow Item 1</li></ul>'
                                        </script>
                                    </body>
                                    </html>`);
        return await runAxe(dom).then((violations) => {
            expect(violations).toHaveLength(0);
        });
        // expect(() => assertAccessible(jsdom, jsdomRules)).not.toThrow();
    });

    it.skip('basic dom with a11y issues', () => {
        expect.assertions(1);
        const jsdom = setupJSDOM(`<html>
                                   <body>
                                     <a href="#"></a>
                                   </body>
                                 </html>`);
        expect(() => assertAccessible(jsdom, jsdomRules)).toThrow();
    });

    it('run axe', async () => {
        const jsdom = setupJSDOM(`<html>
                                   <body>
                                     <a href="#"></a>
                                   </body>
                                 </html>`);
        return await runAxe(jsdom).then((violations) => {
            expect(violations.length).toBeGreaterThan(0);
        });
    });
});
