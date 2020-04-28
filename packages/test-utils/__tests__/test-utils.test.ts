/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { afterEachCleanup, beforeAllSetup, cartesianProduct } from '../src';
import { extended, recommended } from '@sa11y/preset-rules';

const testDOMCleanupContent = 'foo';

beforeAll(() => {
    beforeAllSetup();
    // Populate DOM to test cleanup after each test
    document.body.innerHTML = testDOMCleanupContent;
});

afterEach(() => {
    afterEachCleanup();
});

describe('test utils jest setup', () => {
    it('should setup jsdom as expected', () => {
        expect(document.documentElement.lang).toBe('en');
    });

    it.each([extended, recommended])('should customize preset-rules as expected', (config) => {
        expect(config.rules['color-contrast'].enabled).toBe(false);
    });

    it('should cleanup document', () => {
        expect(document.body.innerHTML).not.toEqual(testDOMCleanupContent);
        expect(document.body.innerHTML).toEqual('');
    });
});

describe('test utils cartesian product', () => {
    const numArr = [0, 1, 2, 3, 4, 5];
    const alphabetArr = ['a', 'b', 'c', 'd', 'e'];
    it('should work as expected', () => {
        expect(cartesianProduct(numArr, alphabetArr)).toMatchSnapshot();
        expect(cartesianProduct(alphabetArr, numArr)).toMatchSnapshot();
        expect(cartesianProduct(numArr, numArr)).toMatchSnapshot();
        expect(cartesianProduct(alphabetArr, alphabetArr)).toMatchSnapshot();
    });
});
