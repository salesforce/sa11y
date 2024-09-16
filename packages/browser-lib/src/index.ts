/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as axe from 'axe-core';
import { exceptionListFilter, appendWcag } from '@sa11y/format';
import { registerCustomRules } from '@sa11y/common';
import {
    defaultRuleset,
    changesData,
    rulesData,
    checkData,
    adaptA11yConfigIncompleteResults,
} from '@sa11y/preset-rules';
export { base, extended, full, adaptA11yConfigIncompleteResults } from '@sa11y/preset-rules';
export const namespace = 'sa11y';

/**
 * Wrapper function to check accessibility to be invoked after the sa11y minified JS file
 * is injected into the browser.
 *
 * @param {Document | HTMLElement} scope - Scope of the analysis, defaults to the document.
 * @param {Object} rules - Preset sa11y rules, defaults to {@link base}.
 * @param {Object} exceptionList - Mapping of rule to CSS selectors to be filtered out using {@link exceptionListFilter}.
 * @param {boolean} addWcagInfo - Flag to add WCAG information to the results, defaults to false.
 * @param {boolean} enableIncompleteResults - Flag to include incomplete results in the analysis, defaults to false.
 * @returns {Promise<string>} JSON stringified filtered results.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function checkAccessibility(
    scope = document,
    rules = defaultRuleset,
    exceptionList = {},
    addWcagInfo = true,
    reportType: 'violations' | 'incomplete' = 'violations'
) {
    // TODO (debug): Adding type annotations to arguments and return type results in error:
    // "[!] Error: Unexpected token" in both rollup-plugin-typescript2 and @rollup/plugin-typescript.
    // Compiling index.ts with tsc and using the dist/index.js file results in an error when importing
    // the "namespace" variable. This would probably be easier to fix, potentially allowing us to
    // remove the rollup TypeScript plugins.

    // To register custom rules
    registerCustomRules(changesData, rulesData, checkData);

    // Adapt rules if incomplete results are enabled
    if (reportType === 'incomplete') {
        rules = adaptA11yConfigIncompleteResults(rules);
    }
    const results = await axe.run(scope || document, rules);
    const filteredResults = exceptionListFilter(results[reportType], exceptionList);

    if (addWcagInfo) {
        appendWcag(filteredResults);
    }
    return JSON.stringify(filteredResults);
}
