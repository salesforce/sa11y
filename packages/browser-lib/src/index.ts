/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as axe from 'axe-core';
import { exceptionListFilter, exceptionList } from '@sa11y/format';
import { A11yConfig, recommended } from '@sa11y/preset-rules';

export const namespace = 'sa11y';

/**
 * Wrapper function to check accessibility to be invoked after the sa11y minified JS file
 * is injected into the browser
 * @param exceptionList - {@link exceptionList} mapping of rule to css selectors to be filtered out using {@link exceptionListFilter}
 * @param rules - preset sa11y rules as {@link A11yConfig} defaulting to {@link recommended}
 */
export async function checkAccessibility(
    exceptionList: exceptionList = {},
    rules: A11yConfig = recommended
): Promise<axe.Result[]> {
    const results = await axe.run(rules);
    return exceptionListFilter(results.violations, exceptionList);
}
