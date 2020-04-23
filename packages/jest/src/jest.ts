/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { assertAccessible } from '@sa11y/assert';
import { A11yConfig, extended } from '@sa11y/preset-rules';

// Type def for custom jest a11y matcher toBeAccessible
// Ref: https://jestjs.io/docs/en/expect.html#expectextendmatchers
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace jest {
        interface Matchers<R> {
            toBeAccessible(config?: A11yConfig): R;
        }
    }
}

/**
 * Jest expect matcher to check document for accessibility issues
 * @param received - Document to be tested for accessibility
 * @param config - A11yConfig to be used to test for accessibility. Defaults to extended.
 */
export async function toBeAccessible(received: Document = document, config: A11yConfig = extended) {
    let isAccessible = true;
    let a11yViolations = '';
    try {
        await assertAccessible(received, config);
    } catch (e) {
        isAccessible = false;
        a11yViolations = e;
    }
    return {
        pass: isAccessible,
        message: (): string => `expected document to have no accessibility violations ${a11yViolations}`,
    };
}

expect.extend({ toBeAccessible });
