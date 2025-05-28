/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { A11yCheckableContext } from '@sa11y/assert';
import { A11yConfig } from '@sa11y/common';
import { defaultRuleset } from '@sa11y/preset-rules';
import { fakeTimerErrMsg, runA11yCheck, formatOptions } from '@sa11y/matcher';

export function isTestUsingFakeTimer(): boolean {
    if (typeof setTimeout === 'undefined') {
        return false;
    }
    // Check for Vitest/Sinon fake timers
    const isVitestFake = 'clock' in setTimeout;
    return isVitestFake;
}

export async function toBeAccessible(
    received: A11yCheckableContext = document,
    config: A11yConfig = defaultRuleset
): Promise<{ pass: boolean; message: () => string }> {
    if (isTestUsingFakeTimer()) throw new Error(fakeTimerErrMsg);

    const { isAccessible, a11yError, receivedMsg } = await runA11yCheck(received, config);

    return {
        pass: isAccessible,
        message: () =>
            `Expected: no accessibility violations\nReceived: ${receivedMsg}\n\n${a11yError.format(formatOptions)}`,
    };
}
