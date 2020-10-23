/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as axe from 'axe-core';
import { exceptionListFilter } from '@sa11y/format';
import { recommended } from '@sa11y/preset-rules';

export const namespace = 'sa11y';

/**
 * Wrapper function to check accessibility to be invoked after the sa11y minified JS file
 * is injected into the browser
 * @param exceptionList - mapping of rule to css selectors to be filtered out using {@link exceptionListFilter}
 * @param rules - preset sa11y rules defaulting to {@link recommended}
 */
export async function checkAccessibility(exceptionList = {}, rules = recommended) {
    // TODO (debug): adding type annotations to args, return type results in error:
    //  "[!] Error: Unexpected token" in both rollup-plugin-typescript2 and @rollup/plugin-typescript
    //  Compiling the index.ts file using tsc and using the dist/index.js file results
    //  in error when importing the "namespace" var. This would probably be easier to fix
    //  which could then result in getting rid of the rollup typescript plugins.
    const results = await axe.run(rules);
    return exceptionListFilter(results.violations, exceptionList);
}
