/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { matcherHint, printReceived } from 'jest-matcher-utils';
import { adaptA11yConfig } from './setup';
import { a11yCheckableContext, assertAccessible } from '@sa11y/assert';
import { A11yError, Options } from '@sa11y/format';
import { A11yConfig, extended } from '@sa11y/preset-rules';

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

const matcherHintMsg = `expected document to have no accessibility violations but found`;
const expectedMsg = `0 issues`;
const FormatOptions: Options = {
    a11yViolationIndicator: '⭕',
    helpUrlIndicator: '🔗',
    highlighter: printReceived,
};

/**
 * Jest expect matcher to check DOM for accessibility issues
 * @param received - DOM or HTML Element to be tested for accessibility. Defaults to current DOM.
 * @param config - A11yConfig to be used to test for accessibility. Defaults to extended.
 */
export async function toBeAccessible(
    received: a11yCheckableContext = document,
    config: A11yConfig = extended
): Promise<jest.CustomMatcherResult> {
    let isAccessible = true;
    let a11yError: A11yError;
    let receivedMsg = expectedMsg;

    // TODO (Improvement): Can we detect if this is invoked async and error if not ?
    try {
        await assertAccessible(received, adaptA11yConfig(config));
    } catch (e) {
        if (e instanceof A11yError) {
            a11yError = e;
            isAccessible = false;
            receivedMsg = `${a11yError.length} issues`;
        } else {
            throw e;
        }
    }

    return {
        pass: isAccessible,
        message: (): string =>
            matcherHint(
                `${toBeAccessible.name}: ${matcherHintMsg} ${receivedMsg}: \n\n ${a11yError.format(FormatOptions)}`,
                `${a11yError.length} issues`,
                expectedMsg
            ),
    };
}
