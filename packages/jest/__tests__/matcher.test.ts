/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { registerSa11yMatcher, toBeAccessible } from '../src';
import { base, extended, getA11yConfig } from '@sa11y/preset-rules';
import {
    beforeEachSetup,
    cartesianProduct,
    domWithA11yIssues,
    domWithA11yIssuesBodyID,
    domWithNoA11yIssues,
    shadowDomID,
} from '@sa11y/test-utils';
import { isTestUsingFakeTimer } from '../src/matcher';
import { automaticCheck } from '../src/automatic';
import { expect, jest } from '@jest/globals';
import { axeRuntimeExceptionMsgPrefix } from '@sa11y/common';

// Collection of values to be tested passed in as different API parameters
const a11yConfigParams = [extended, base, undefined];
const domParams = [document, undefined];
const domConfigParams = cartesianProduct(domParams, a11yConfigParams);

beforeAll(() => {
    registerSa11yMatcher();
});

beforeEach(() => {
    beforeEachSetup();
});

describe('a11y matchers', () => {
    it('should be extendable with expect', () => {
        // Mostly here for code cov as it doesn't register correctly with just registerSa11yMatcher()
        expect.extend({ toBeAccessible });
    });
});

describe('toBeAccessible jest a11y matcher', () => {
    /* eslint-disable @typescript-eslint/no-unsafe-call */
    it.each(domConfigParams)('should not throw error for dom with no a11y issues (arg: %#)', async (dom, config) => {
        document.body.innerHTML = domWithNoA11yIssues;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await expect(dom).toBeAccessible(config);
    });

    it.each(a11yConfigParams)('should throw error for dom with a11y issues with config: %#', async (config) => {
        document.body.innerHTML = domWithA11yIssues;
        // using the 'not' matcher just for testing, not expecting this to be used out of the unit testing context
        await expect(document).not.toBeAccessible(config);
        await expect(document.getElementById(domWithA11yIssuesBodyID)).not.toBeAccessible();
        // using without the 'not' matcher which should be the primary way the API is used (without error catching)
        await expect(expect(document).toBeAccessible()).rejects.toThrow();
    });

    it('should be able to check a11y of a HTML element with no issues', async () => {
        document.body.innerHTML = domWithNoA11yIssues;
        const elem = document.getElementById(shadowDomID);
        expect(elem).toBeTruthy();
        await expect(expect(elem).toBeAccessible()).resolves.toBeUndefined();
    });

    it('should be able to check a11y of a HTML element with no issues: %s', async () => {
        document.body.innerHTML = domWithA11yIssues;
        const elem = document.getElementById(domWithA11yIssuesBodyID);
        expect(elem).toBeTruthy();
        await expect(expect(elem).toBeAccessible()).rejects.toThrow();
    });

    it('should throw non A11yError for non a11y issues', async () => {
        const errConfig = getA11yConfig(['non-existent-rule']);
        await expect(expect(document).toBeAccessible(errConfig)).rejects.toThrow(axeRuntimeExceptionMsgPrefix);
    });
    /* eslint-enable @typescript-eslint/no-unsafe-call */
});

describe('mock timer helper', () => {
    afterEach(jest.useRealTimers);

    it('should detect when mock timer is being used', () => {
        // Baseline checks
        expect(isTestUsingFakeTimer()).toBeFalsy();
        jest.useRealTimers();
        expect(isTestUsingFakeTimer()).toBeFalsy();
        // Fake timer check
        for (const mode of ['modern', 'legacy']) {
            jest.useFakeTimers(mode);
            expect(isTestUsingFakeTimer()).toBeTruthy();
        }
        // Revert back and check
        jest.useRealTimers();
        expect(isTestUsingFakeTimer()).toBeFalsy();
    });

    /* eslint-disable @typescript-eslint/no-unsafe-call */
    it('should result in error when mock timer is being used from API', async () => {
        // Baseline check
        document.body.innerHTML = domWithNoA11yIssues;
        await expect(document).toBeAccessible();
        // Check for error when using fake timer
        jest.useFakeTimers();
        await expect(expect(document).toBeAccessible()).rejects.toThrow();
    });
    /* eslint-enable @typescript-eslint/no-unsafe-call */

    it('should skip automatic check when mock timer is being used', async () => {
        document.body.innerHTML = domWithA11yIssues;

        await expect(automaticCheck()).rejects.toThrow();

        jest.useFakeTimers();
        await expect(automaticCheck()).resolves.toBeUndefined();

        jest.useRealTimers();
        await expect(automaticCheck()).rejects.toThrow();
    });
});
