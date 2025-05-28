/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { A11yCheckableContext, assertAccessible } from '@sa11y/assert';
import { A11yError, Options } from '@sa11y/format';
import { defaultRuleset, adaptA11yConfig } from '@sa11y/preset-rules';
import { A11yConfig } from '@sa11y/common';

const expectedMsg = `0 issues`;

export const formatOptions: Options = {
    a11yViolationIndicator: '⭕',
    helpUrlIndicator: '🔗',
    highlighter: (text) => text,
    deduplicate: false,
};

export const fakeTimerErrMsg =
    'Cannot run accessibility check when fake timer is in use. ' +
    'Switch to real timer before invoking accessibility check.';

export async function runA11yCheck(
    received: A11yCheckableContext = document,
    config: A11yConfig = defaultRuleset
): Promise<{ isAccessible: boolean; a11yError: A11yError; receivedMsg: string }> {
    let isAccessible = true;
    let a11yError: A11yError = new A11yError([], []);
    let receivedMsg = expectedMsg;

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

    return { isAccessible, a11yError, receivedMsg };
}
