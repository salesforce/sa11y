/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { assertAccessible } from '@sa11y/assert';
import { extended, A11yConfig } from '@sa11y/preset-rules';
import { matcherHint } from 'jest-matcher-utils';
import { adaptA11yConfig } from './setup';

export const matcherHintMsg = `expected document to have no accessibility violations but found following issues: `;

// Type def for custom jest a11y matchers
// Ref: https://jestjs.io/docs/en/expect.html#expectextendmatchers
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace jest {
        interface Matchers<R> {
            toBeAccessible(config?: A11yConfig): Promise<CustomMatcherResult>;
        }
    }
}

/**
 * Jest expect matcher to check DOM for accessibility issues
 * @param receivedDom - DOM to be tested for accessibility. Defaults to current DOM.
 * @param config - A11yConfig to be used to test for accessibility. Defaults to extended.
 */
export async function toBeAccessible(
    receivedDom: Document = document,
    config: A11yConfig = extended
): Promise<jest.CustomMatcherResult> {
    let isAccessible = true;
    let a11yViolations = '';

    try {
        // TODO (feat): There might be a need to test selected element(s) in a DOM.
        //  If we need that we could add the ability to pass in CSS selector(s).
        //  Approach of jest-axe lib to store/restore DOM might not be efficient and have potential side effects.
        await assertAccessible(receivedDom, adaptA11yConfig(config));
    } catch (e) {
        isAccessible = false;
        a11yViolations = e;
    }
    return {
        pass: isAccessible,
        // Display assertion for the report when a test fails
        message: (): string => matcherHint(`${toBeAccessible.name}: ${matcherHintMsg} \n\n ${a11yViolations}`),
    };
}
