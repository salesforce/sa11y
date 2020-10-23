/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { beforeEachSetup, cartesianProduct, checkA11yError, setupWDIO, teardownWDIO } from '../src';
import { axeRuntimeExceptionMsgPrefix } from '@sa11y/common';
import { getBrowser, getConfigWDIO } from '../src/wdio';
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

describe('test utils check a11y error', () => {
    it('should check for error to be defined', () => {
        expect.assertions(2);
        expect(() => checkA11yError(undefined)).toThrowErrorMatchingSnapshot();
    });

    it('should check for axe run time exception', () => {
        expect.assertions(3);
        expect(() => checkA11yError(new Error(axeRuntimeExceptionMsgPrefix))).toThrowErrorMatchingSnapshot();
    });

    it('should check for error to match snapshot', () => {
        expect.assertions(4);
        expect(() => checkA11yError(new Error('foo'))).not.toThrow();
    });
});

describe('wdio test utils', () => {
    afterEach(teardownWDIO);

    it('should create browser object', async () => {
        const browser = await getBrowser(false);
        expect(browser).toBeTruthy();
    });

    it('should setup and cleanup browser in global namespace', async () => {
        expect(global.browser).toBeFalsy();
        await setupWDIO();
        expect(global.browser).toBeTruthy();
        // Calling setup multiple times should return the same browser instance
        const browser = global.browser;
        await setupWDIO();
        expect(browser).toStrictEqual(global.browser);
        // Calling teardown should destroy the browser instance
        await teardownWDIO();
        expect(global.browser).toBeFalsy();
    });

    it('should not set headless config in debug mode', () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const getArgs = (debug) => getConfigWDIO(debug).capabilities['goog:chromeOptions'].args as string[];
        expect(getArgs(false)).toContain('--headless');
        expect(getArgs(true)).not.toContain('--headless');
    });
});
