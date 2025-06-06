/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { matcherHint, printReceived } from 'jest-matcher-utils';
import { A11yCheckableContext } from '@sa11y/assert';
import { A11yConfig } from '@sa11y/common';
import { defaultRuleset } from '@sa11y/preset-rules';
import { fakeTimerErrMsg, runA11yCheck, formatOptions } from '@sa11y/matcher';

// Type def for custom jest a11y matchers
// Ref: https://jestjs.io/docs/en/expect.html#expectextendmatchers
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace jest {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        interface Matchers<R> extends jest.CustomMatcher {
            toBeAccessible(config?: A11yConfig): Promise<CustomMatcherResult>;
        }
    }
}

/**
 * Detect if fake timer is being used in a jest test.
 * Fake timers result in axe timeout https://github.com/dequelabs/axe-core/issues/3055
 * Workaround until underlying issue can be fixed in axe.
 * Ref: https://github.com/facebook/jest/issues/10555
 */
export function isTestUsingFakeTimer(): boolean {
    return (
        typeof jest !== 'undefined' &&
        typeof setTimeout !== 'undefined' &&
        // eslint-disable-next-line no-prototype-builtins
        (setTimeout.hasOwnProperty('_isMockFunction') || setTimeout.hasOwnProperty('clock'))
    );
}

export async function toBeAccessible(
    received: A11yCheckableContext = document,
    config: A11yConfig = defaultRuleset
): Promise<jest.CustomMatcherResult & { a11yError: Error }> {
    if (isTestUsingFakeTimer()) throw new Error(fakeTimerErrMsg);

    const { isAccessible, a11yError, receivedMsg } = await runA11yCheck(received, config);
    return {
        pass: isAccessible,
        message: (): string =>
            matcherHint(`toBeAccessible`) +
            `\n\nExpected: no accessibility violations\nReceived: ${receivedMsg}\n\n${a11yError.format({
                ...formatOptions,
                highlighter: printReceived,
            })}`,
        a11yError,
    };
}
