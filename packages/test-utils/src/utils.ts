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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
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
 * Check if given error is an a11y error and not an axe runtime exception.
 * Make sure to use `expect.assertions(..)` before calling this method esp in the `catch`
 * block to make sure the test is not passing without running into the `catch` block.
 */
export function checkA11yError(e: Error): void {
    expect(e).toBeTruthy();
    expect(e.message).not.toContain(axeRuntimeExceptionMsgPrefix);
    expect(e.message).toMatchSnapshot();
}

/**
 * Check error thrown by calling given function.
 * Preferable to using `checkA11yError` with `expect.assertions(..)` due to
 * https://github.com/jest-community/eslint-plugin-jest/blob/main/docs/rules/no-conditional-expect.md
 */
export async function checkA11yErrorFunc(func: CallableFunction, expectRuntimeError = false): Promise<void> {
    let err = new Error();
    try {
        await func();
    } catch (e) {
        err = e as Error;
    } finally {
        if (expectRuntimeError) {
            expect(err.message).toContain(axeRuntimeExceptionMsgPrefix);
        } else {
            checkA11yError(err);
        }
    }
}
