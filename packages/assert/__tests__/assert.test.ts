/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { assertAccessible, getViolationsJSDOM } from '../src/assert';
import { base, getA11yConfig, recommended } from '@sa11y/preset-rules';
import { axeRuntimeExceptionMsgPrefix } from '@sa11y/common';
import {
    a11yIssuesCount,
    audioURL,
    beforeEachSetup,
    checkA11yError,
    domWithA11yIssues,
    domWithNoA11yIssues,
    shadowDomID,
    videoURL,
} from '@sa11y/test-utils';

beforeEach(() => {
    beforeEachSetup();
});

describe('assertAccessible API', () => {
    it('should trigger axe runtime exception for non existent rule', async () => {
        const errConfig = getA11yConfig(['non-existent-rule']);
        expect.assertions(2);
        await assertAccessible(document, errConfig).catch((e: Error) => {
            expect(e).toBeTruthy();
            expect(e.toString()).toContain(axeRuntimeExceptionMsgPrefix);
        });
    });

    it.each([base, recommended])(
        'should throw no errors for dom with no a11y issues with config %#',
        async (config) => {
            document.body.innerHTML = domWithNoA11yIssues;
            expect(async () => await getViolationsJSDOM(document, config)).toHaveLength(0);
            await assertAccessible(document, config); // No error thrown
        }
    );

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
            await assertAccessible().catch((e) => checkA11yError(e));
        }
    );

    it('should throw an error with a11y issues found for dom with a11y issues', async () => {
        document.body.innerHTML = domWithA11yIssues;
        expect.assertions(3);
        await assertAccessible(document, recommended).catch((e: Error) => {
            checkA11yError(e);
        });
    });

    it('should not throw error with HTML element with no a11y issues', async () => {
        document.body.innerHTML = domWithNoA11yIssues;
        const elem = document.getElementById(shadowDomID);
        expect(elem).toBeTruthy();
        await assertAccessible(elem); // No error thrown
    });

    it('should throw error with HTML element with a11y issues', async () => {
        expect.assertions(5);
        document.body.innerHTML = domWithA11yIssues;
        const elements = document.getElementsByTagName('body');
        expect(elements).toHaveLength(1);
        const elem = elements[0];
        expect(elem).toBeTruthy();
        await assertAccessible(elem).catch((e) => checkA11yError(e));
    });

    it.each(['', 'non-existent-audio.mp3', audioURL])(
        'should test audio without timing-out using src %#',
        async (source: string) => {
            document.body.innerHTML = `<audio src=${source}>Audio test</audio>`;
            await assertAccessible(document, getA11yConfig(['audio-caption', 'no-autoplay-audio']));
        }
    );

    it.each(['', 'non-existent-video.webm', videoURL])(
        'should test video without timing-out using src %#',
        async (source: string) => {
            document.body.innerHTML = `<video src=${source}>Video test</video>`;
            await assertAccessible(document, getA11yConfig(['video-caption', 'no-autoplay-audio']));
        }
    );
});
