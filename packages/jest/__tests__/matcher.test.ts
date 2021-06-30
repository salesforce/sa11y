/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { registerSa11yMatcher, toBeAccessible } from '../src';
import { base, recommended, getA11yConfig } from '@sa11y/preset-rules';
import {
    beforeEachSetup,
    cartesianProduct,
    checkA11yErrorFunc,
    domWithA11yIssues,
    domWithA11yIssuesBodyID,
    domWithNoA11yIssues,
    shadowDomID,
    a11yIssuesCount,
} from '@sa11y/test-utils';

// Collection of values to be tested passed in as different API parameters
const a11yConfigParams = [recommended, base, undefined];
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
    it.each(domConfigParams)('should not throw error for dom with no a11y issues (arg: %#)', async (dom, config) => {
        document.body.innerHTML = domWithNoA11yIssues;
        await expect(dom).toBeAccessible(config);
    });

    it.each(a11yConfigParams)('should throw error for dom with a11y issues with config: %#', async (config) => {
        document.body.innerHTML = domWithA11yIssues;
        // using the 'not' matcher just for testing, not expecting this to be used out of the unit testing context
        await expect(document).not.toBeAccessible(config);
        await expect(document.getElementById(domWithA11yIssuesBodyID)).not.toBeAccessible();
        // using without the 'not' matcher which should be the primary way the API is used (without error catching)
        await checkA11yErrorFunc(() => expect(document).toBeAccessible());
    });

    it.each([
        // dom with no issues won't result in error thrown and hence will have less assertions
        [shadowDomID, domWithNoA11yIssues],
        [domWithA11yIssuesBodyID, domWithA11yIssues],
    ])('should be able to check a11y of a HTML element: %s', async (id: string, dom: string) => {
        document.body.innerHTML = dom;
        const elem = document.getElementById(id);
        expect(elem).toBeTruthy();
        await checkA11yErrorFunc(() => expect(elem).toBeAccessible());
    });

    it('should throw non A11yError for non a11y issues', async () => {
        const errConfig = getA11yConfig(['non-existent-rule']);
        await checkA11yErrorFunc(() => expect(document).toBeAccessible(errConfig), true);
    });
});
