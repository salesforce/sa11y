/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * Cartesian product of arrays
 * Ref: https://eddmann.com/posts/cartesian-product-in-javascript/
 */
export function cartesianProduct(...sets: Array<any>): Array<any> {
    // TODO(types): Fix types for the cartesianProduct function - from any to generics
    const flatten = (arr: Array<any>) => [].concat([], ...arr);
    return sets.reduce((acc, set) => flatten(acc.map((x: any) => set.map((y: any) => [...x, y]))), [[]]);
}
