/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { assertAccessible, getViolationsJSDOM } from '../src/assert';
import { base, extended, defaultPriority, getA11yConfig } from '@sa11y/preset-rules';
import {
    a11yIssuesCount,
    audioURL,
    beforeEachSetup,
    checkA11yError,
    checkA11yErrorFunc,
    domWithA11yIssues,
    domWithNoA11yIssues,
    shadowDomID,
    videoURL,
} from '@sa11y/test-utils';
import { A11yConfig } from '@sa11y/common';

// Create a11y config with a map of rules with default priority and wcag sc from given
// list of rule ids
function getA11yConfigMap(rules: string[]): A11yConfig {
    return getA11yConfig(
        new Map(rules.map((ruleId) => [ruleId, { priority: defaultPriority, wcagSC: '', wcagLevel: '' }]))
    );
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
        expect(async () => await getViolationsJSDOM(document, config)).toHaveLength(0);
        await assertAccessible(document, config); // No error thrown
    });

    it.each([
        // DOM to test, expected assertions, expected a11y violations
        [domWithNoA11yIssues, 1, 0],
        [domWithA11yIssues, 4, a11yIssuesCount - 1],
    ])(
        'should use default document, ruleset, formatter when called with no args - expecting %# assertion',
        async (testDOM: string, expectedAssertions: number, expectedViolations: number) => {
            document.body.innerHTML = testDOM;
            expect.assertions(expectedAssertions);
            await expect(getViolationsJSDOM()).resolves.toHaveLength(expectedViolations);
            await assertAccessible().catch((e: Error) => checkA11yError(e));
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
