/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as axe from 'axe-core';
import { exceptionListFilter, appendWcag } from '@sa11y/format';
import { registerCustomRules } from '@sa11y/common';
import { defaultRuleset, changesData, rulesData, checkData } from '@sa11y/preset-rules';
export { base, extended, full } from '@sa11y/preset-rules';
export const namespace = 'sa11y';

/**
 * Wrapper function to check accessibility to be invoked after the sa11y minified JS file
 * is injected into the browser
 * @param scope - Scope of the analysis as {@link A11yCheckableContext}
 * @param rules - preset sa11y rules defaulting to {@link base}
 * @param exceptionList - mapping of rule to css selectors to be filtered out using {@link exceptionListFilter}
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function checkAccessibility(
    scope = document,
    rules = defaultRuleset,
    exceptionList = {},
    addWcagInfo = false
) {
    // TODO (debug): adding type annotations to args, return type results in error:
    //  "[!] Error: Unexpected token" in both rollup-plugin-typescript2 and @rollup/plugin-typescript
    //  Compiling the index.ts file with tsc and using the dist/index.js file results
    //  in error when importing the "namespace" var. This would probably be easier to fix
    //  which could then result in getting rid of the rollup typescript plugins.

    // To register custom rules
    registerCustomRules(changesData, rulesData, checkData);

    const results = await axe.run(scope || document, rules);
    const filteredResults = exceptionListFilter(results.violations, exceptionList);

    if (addWcagInfo) {
        appendWcag(filteredResults);
    }
    return JSON.stringify(filteredResults);
}
