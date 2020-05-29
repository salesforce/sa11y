/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { axeRuntimeExceptionMsgPrefix } from '@sa11y/common';

/**
 * Cartesian product of arrays
 * Ref: https://eddmann.com/posts/cartesian-product-in-javascript/
 */
// TODO(types): Fix types for the cartesianProduct function - from any to generics
/* eslint-disable @typescript-eslint/no-explicit-any */
export function cartesianProduct(...sets: Array<any>): Array<any> {
    const flatten = (arr: Array<any>): Array<any> => [].concat([], ...arr);
    return sets.reduce((acc, set) => flatten(acc.map((x: any) => set.map((y: any) => [...x, y]))), [[]]);
    /* eslint-enable @typescript-eslint/no-explicit-any */
}

/**
 * Common Jest setup that sets up JSDOM as required for the tests
 */
export function beforeEachSetup(): void {
    document.documentElement.lang = 'en'; // required for a11y lang check
    document.body.innerHTML = ''; // reset body content
}

/**
 * Check if given error is an a11y error and not an axe runtime exception
 */
export function checkA11yError(e: Error): void {
    expect(e).toBeTruthy();
    expect(e.toString()).not.toContain(axeRuntimeExceptionMsgPrefix);
    expect(e).toMatchSnapshot();
}
