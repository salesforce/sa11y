/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import 'global-jsdom/lib/register'; // https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#required-globals
import { matcherHintMsg, toBeAccessible, toBeAccessibleWith } from '../src/jest';
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

// Collection of values to be tested passed in as different API parameters
const a11yConfigParams = [extended, recommended, undefined];
const domParams = [document, undefined];

// Ref: https://eddmann.com/posts/cartesian-product-in-javascript/
const flatten = (arr) => [].concat([], ...arr);
const cartesianProduct = (...sets) =>
    sets.reduce((acc, set) => flatten(acc.map((x) => set.map((y) => [...x, y]))), [[]]);

const domConfigParams = cartesianProduct(domParams, a11yConfigParams);

beforeAll(() => {
    expect.extend({ toBeAccessible });
    expect.extend({ toBeAccessibleWith });
    document.documentElement.lang = 'en'; // required for a11y lang check
});

afterEach(() => {
    document.body.innerHTML = ''; // reset dom body
});

describe('toBeAccessible jest a11y matcher', () => {
    it.each(domParams)('should not throw error for dom with no a11y issues (Dom arg: %#)', async (dom) => {
        document.body.innerHTML = domWithNoA11yIssues;
        await expect(dom).toBeAccessible();
    });

    it.each(a11yConfigParams)('should throw error for dom with a11y issues with config: %#', async (config) => {
        document.body.innerHTML = domWithA11yIssues;
        expect.assertions(3);
        // using the 'not' matcher just for testing, not expecting this to be used out of the unit testing context
        await expect(document).not.toBeAccessible(config);
        // using without the 'not' matcher which should be the primary way the API is used (without error catching)
        try {
            await expect(document).toBeAccessible(config);
        } catch (e) {
            expect(e.message).toContain(matcherHintMsg);
        }
    });
});

// Note: "toBeAccessibleWith" needs to be its own test. Combining using .each([toBeAccessible, toBeAccessibleWith])
//  and function references doesn't seem to work with matchers. Error: "not a function".
// TODO (de-duplicate): Figure out a way to reduce duplication between tests for 2 matchers - extract common code into functions
describe('toBeAccessibleWith jest a11y matcher', () => {
    it.each(domConfigParams)('should not throw error for dom with no a11y issues (arg: %#)', async (dom, config) => {
        document.body.innerHTML = domWithNoA11yIssues;
        await expect(dom).toBeAccessibleWith(config);
    });

    it.each(a11yConfigParams)('should throw error for dom with a11y issues with config: %#', async (config) => {
        document.body.innerHTML = domWithA11yIssues;
        expect.assertions(3);
        // using the 'not' matcher just for testing, not expecting this to be used out of the unit testing context
        await expect(document).not.toBeAccessibleWith(config);
        // using without the 'not' matcher which should be the primary way the API is used (without error catching)
        try {
            await expect(document).toBeAccessibleWith(config);
        } catch (e) {
            expect(e.message).toContain(matcherHintMsg);
        }
    });
});
