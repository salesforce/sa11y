/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { beforeEachSetup, cartesianProduct } from '../src';
import { expect } from '@jest/globals';
const testDOMCleanupContent = 'foo';

beforeAll(() => {
    // Populate DOM to test cleanup after each test
    document.body.innerHTML = testDOMCleanupContent;
});

beforeEach(() => {
    beforeEachSetup();
});

describe('test utils jest setup', () => {
    it('should setup jsdom as expected', () => {
        expect(document.documentElement.lang).toBe('en');
    });

    it('should cleanup document', () => {
        expect(document.body.innerHTML).not.toEqual(testDOMCleanupContent);
        expect(document.body.innerHTML).toBe('');
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
