/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import 'global-jsdom/lib/register'; // https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#required-globals
import { matcherHintMsg, toBeAccessible, toBeAccessibleWith } from '../src/jest';
import { extended, recommended } from '@sa11y/preset-rules';
import {
    afterEachCleanup,
    beforeAllSetup,
    cartesianProduct,
    domWithA11yIssues,
    domWithNoA11yIssues,
} from '@sa11y/test-utils';

// Collection of values to be tested passed in as different API parameters
const a11yConfigParams = [extended, recommended, undefined];
const domParams = [document, undefined];
const domConfigParams = cartesianProduct(domParams, a11yConfigParams);

beforeAll(() => {
    beforeAllSetup();
    expect.extend({ toBeAccessible });
    expect.extend({ toBeAccessibleWith });
});

afterEach(() => {
    afterEachCleanup();
});

describe('toBeAccessible jest a11y matcher', () => {
    it.each(domParams)('should not throw error for dom with no a11y issues (Dom arg: %#)', async (dom) => {
        document.body.innerHTML = domWithNoA11yIssues;
        await expect(dom).toBeAccessible();
    });

    it.each(a11yConfigParams)('should throw error for dom with a11y issues with config: %#', async (config) => {
        document.body.innerHTML = domWithA11yIssues;
        expect.assertions(3);
        // using the 'not' matcher just for testing, not expecting this to be used out of the unit testing context
        await expect(document).not.toBeAccessible(config);
        // using without the 'not' matcher which should be the primary way the API is used (without error catching)
        try {
            await expect(document).toBeAccessible(config);
        } catch (e) {
            expect(e.message).toContain(matcherHintMsg);
        }
    });
});

// Note: "toBeAccessibleWith" needs to be its own test. Combining using .each([toBeAccessible, toBeAccessibleWith])
//  and function references doesn't seem to work with matchers. Error: "not a function".
// TODO (de-duplicate): Figure out a way to reduce duplication between tests for 2 matchers - extract common code into functions
describe('toBeAccessibleWith jest a11y matcher', () => {
    it.each(domConfigParams)('should not throw error for dom with no a11y issues (arg: %#)', async (dom, config) => {
        document.body.innerHTML = domWithNoA11yIssues;
        await expect(dom).toBeAccessibleWith(config);
    });

    it.each(a11yConfigParams)('should throw error for dom with a11y issues with config: %#', async (config) => {
        document.body.innerHTML = domWithA11yIssues;
        expect.assertions(3);
        // using the 'not' matcher just for testing, not expecting this to be used out of the unit testing context
        await expect(document).not.toBeAccessibleWith(config);
        // using without the 'not' matcher which should be the primary way the API is used (without error catching)
        try {
            await expect(document).toBeAccessibleWith(config);
        } catch (e) {
            expect(e.message).toContain(matcherHintMsg);
        }
    });
});
