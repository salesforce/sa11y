/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { assertAccessible, getA11yResults } from '../src/assert';
import { base, extended, defaultPriority, getA11yConfig, adaptA11yConfigIncompleteResults } from '@sa11y/preset-rules';
import {
    a11yIssuesCount,
    audioURL,
    beforeEachSetup,
    domWithA11yIncompleteIssues,
    domWithA11yIssues,
    domWithNoA11yIssues,
    shadowDomID,
    videoURL,
} from '@sa11y/test-utils';
import { A11yConfig, axeRuntimeExceptionMsgPrefix } from '@sa11y/common';
import { expect } from '@jest/globals';

// Create a11y config with a map of rules with default priority and wcag sc from given
// list of rule ids
function getA11yConfigMap(rules: string[]): A11yConfig {
    return getA11yConfig(
        new Map(rules.map((ruleId) => [ruleId, { priority: defaultPriority, wcagSC: '', wcagLevel: '' }]))
    );
}

/**
 * Check error thrown by calling given function.
 * Preferable to using `checkA11yError` with `expect.assertions(..)` due to
 * https://github.com/jest-community/eslint-plugin-jest/blob/main/docs/rules/no-conditional-expect.md
 */
async function checkA11yErrorFunc(
    errorThrower: CallableFunction,
    expectRuntimeError = false,
    expectNoError = false
): Promise<void> {
    expect.hasAssertions();
    let err = new Error();
    try {
        await errorThrower();
    } catch (e) {
        err = e as Error;
    } finally {
        if (expectNoError) {
            expect(err.message).toHaveLength(0);
        } else if (expectRuntimeError) {
            expect(err.message).toContain(axeRuntimeExceptionMsgPrefix);
        } else {
            expect(err).toBeTruthy();
            expect(err.message).not.toContain(axeRuntimeExceptionMsgPrefix);
            expect(err.message).toMatchSnapshot();
        }
    }
}

beforeEach(() => {
    beforeEachSetup();
});

describe('assertAccessible API', () => {
    // eslint-disable-next-line jest/expect-expect
    it('should trigger axe runtime exception for non existent rule', async () => {
        const errConfig = getA11yConfigMap(['non-existent-rule']);
        await checkA11yErrorFunc(() => assertAccessible(document, errConfig), true);
    });

    it.each([base, extended])('should throw no errors for dom with no a11y issues with config %#', async (config) => {
        document.body.innerHTML = domWithNoA11yIssues;
        expect(async () => await getA11yResults(document, config, false)).toHaveLength(0);
        await assertAccessible(document, config); // No error thrown
    });

    it('should throw errors for dom with incomplete issues with base config', async () => {
        document.body.innerHTML = domWithA11yIncompleteIssues;
        const config = adaptA11yConfigIncompleteResults(base);
        expect(await getA11yResults(document, config, true)).toHaveLength(1);
    });

    it.each([
        // DOM to test, expected assertions, expected a11y violations
        [domWithNoA11yIssues, 2, 0],
        [domWithA11yIssues, 2, a11yIssuesCount - 3],
    ])(
        'should use default document, ruleset, formatter when called with no args - expecting %# assertion',
        async (testDOM: string, expectedAssertions: number, expectedViolations: number) => {
            document.body.innerHTML = testDOM;
            expect.assertions(expectedAssertions);
            await expect(getA11yResults()).resolves.toHaveLength(expectedViolations);
            if (expectedViolations > 0) {
                // eslint-disable-next-line jest/no-conditional-expect
                await expect(assertAccessible()).rejects.toThrow(`${expectedViolations} Accessibility issues found`);
            } else {
                // eslint-disable-next-line jest/no-conditional-expect
                await expect(assertAccessible()).resolves.toBeUndefined();
            }
        }
    );

    // eslint-disable-next-line jest/expect-expect
    it('should throw an error with a11y issues found for dom with a11y issues', async () => {
        document.body.innerHTML = domWithA11yIssues;
        await checkA11yErrorFunc(() => assertAccessible(document));
    });

    it('should not throw error with HTML element with no a11y issues', async () => {
        document.body.innerHTML = domWithNoA11yIssues;
        const elem = document.getElementById(shadowDomID);
        expect(elem).toBeTruthy();
        await checkA11yErrorFunc(() => assertAccessible(document), false, true);
    });

    it('should throw error with HTML element with a11y issues', async () => {
        document.body.innerHTML = domWithA11yIssues;
        const elements = document.getElementsByTagName('body');
        expect(elements).toHaveLength(1);
        const elem = elements[0];
        expect(elem).toBeTruthy();
        await checkA11yErrorFunc(() => assertAccessible(elem));
    });

    it('should throw error with HTML element with a11y issues when passed with selector keywords', async () => {
        document.body.innerHTML = domWithA11yIssues;
        const elements = document.getElementsByTagName('body');
        expect(elements).toHaveLength(1);
        const elem = elements[0];
        expect(elem).toBeTruthy();
        process.env.SELECTOR_FILTER_KEYWORDS = 'lightning-';
        await checkA11yErrorFunc(() => assertAccessible(elem));
        delete process.env.SELECTOR_FILTER_KEYWORDS;
    });

    // eslint-disable-next-line jest/expect-expect
    it.each(['', 'non-existent-audio.mp3', audioURL])(
        'should test audio without timing-out using src %#',
        async (source: string) => {
            document.body.innerHTML = `<audio src=${source}>Audio test</audio>`;
            await checkA11yErrorFunc(
                () => assertAccessible(document, getA11yConfigMap(['audio-caption', 'no-autoplay-audio'])),
                false,
                true
            );
        }
    );

    // eslint-disable-next-line jest/expect-expect
    it.each(['', 'non-existent-video.webm', videoURL])(
        'should test video without timing-out using src %#',
        async (source: string) => {
            document.body.innerHTML = `<video src=${source}>Video test</video>`;
            await checkA11yErrorFunc(
                () => assertAccessible(document, getA11yConfigMap(['video-caption', 'no-autoplay-audio'])),
                false,
                true
            );
        }
    );
});
