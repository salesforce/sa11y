/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import 'global-jsdom/lib/register'; // https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#required-globals
import { assertAccessible, axeRuntimeExceptionMsgPrefix } from '../src/assert';
import { extended, getA11yConfig, recommended } from '@sa11y/preset-rules';
import { a11yResultsFormatter } from '@sa11y/format';
import { beforeEachSetup, domWithA11yIssues, domWithNoA11yIssues, shadowDomID } from '@sa11y/test-utils';

beforeEach(() => {
    beforeEachSetup();
});

/**
 * Test util to check if given error is an a11y error
 */
function checkA11yError(e: Error): void {
    expect(e).toBeDefined();
    expect(e.toString()).not.toContain(axeRuntimeExceptionMsgPrefix);
    expect(e).toMatchSnapshot();
}

/**
 * Test util to test DOM with a11y issues
 * @param formatter - a11y results formatter
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function testDOMWithA11yIssues(formatter = a11yResultsFormatter) {
    document.body.innerHTML = domWithA11yIssues;
    expect.assertions(3);
    await assertAccessible(document, extended, formatter).catch((e) => {
        checkA11yError(e);
    });
}

describe('assertAccessible API', () => {
    it('should trigger axe runtime exception for non existent rule', async () => {
        const errConfig = getA11yConfig(['non-existent-rule']);
        expect.assertions(2);
        await assertAccessible(document, errConfig).catch((e) => {
            expect(e).toBeDefined();
            expect(e.toString()).toContain(axeRuntimeExceptionMsgPrefix);
        });
    });

    // eslint-disable-next-line jest/expect-expect
    it.each([recommended, extended])(
        'should throw no errors for dom with no a11y issues with config %#',
        async (config) => {
            document.body.innerHTML = domWithNoA11yIssues;
            await assertAccessible(document, config); // No error thrown
        }
    );

    it.each([
        // DOM to test, expected assertions
        [domWithNoA11yIssues, 0],
        [domWithA11yIssues, 3],
    ])(
        'should use default document, ruleset, formatter when called with no args - expecting %# assertion',
        async (testDOM: string, expectedAssertions: number) => {
            expect.assertions(expectedAssertions);
            document.body.innerHTML = testDOM;
            await assertAccessible().catch((e) => checkA11yError(e));
        }
    );

    // eslint-disable-next-line jest/expect-expect
    it('should throw an error with a11y issues found for dom with a11y issues', testDOMWithA11yIssues);

    it('should not throw error with HTML element with no a11y issues', async () => {
        document.body.innerHTML = domWithNoA11yIssues;
        const elem = document.getElementById(shadowDomID);
        expect(elem).toBeDefined();
        await assertAccessible(elem); // No error thrown
    });

    it('should throw error with HTML element with a11y issues', async () => {
        expect.assertions(5);
        document.body.innerHTML = domWithA11yIssues;
        const elements = document.getElementsByTagName('body');
        expect(elements).toHaveLength(1);
        const elem = elements[0];
        expect(elem).toBeDefined();
        await assertAccessible(elem).catch((e) => checkA11yError(e));
    });

    it.each([a11yResultsFormatter, null])('should format a11y issues using specified formatter: %#', (formatter) =>
        testDOMWithA11yIssues(formatter)
    );
});
