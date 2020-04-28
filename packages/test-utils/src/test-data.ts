/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// DOM with no a11y issues
export const domWithA11yIssues = `<html>
                            <body>
                             <a href="#"></a>
                            </body>
                           </html>`;

// DOM containing a11y issues
// From https://github.com/dequelabs/axe-selenium-java/blob/develop/src/test/resources/test-app.js-->
export const domWithNoA11yIssues = `<!doctype html>
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
