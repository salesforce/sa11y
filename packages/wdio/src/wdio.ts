/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
import { A11yConfig, extended } from '@sa11y/preset-rules';
import * as axe from 'axe-core';
import { axeRuntimeExceptionMsgPrefix } from '@sa11y/common';
import { A11yError } from '@sa11y/format';
import { BrowserObject } from 'webdriverio';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function assertAccessible(driver: BrowserObject = browser, rules: A11yConfig = extended) {
    // TODO (deduplicate): with @sa11y/assert
    let violations;
    try {
        // inject the script
        await driver.execute(axe.source);

        // run inside browser and get results
        violations = await driver.executeAsync((rules, done) => {
            // TODO (feat): Add ability to target specific parts of document (by Element or CSS selector)
            axe.run(document, rules, function (err: Error, results: axe.AxeResults) {
                if (err) throw err;
                done(results.violations);
            });
        }, rules);
    } catch (e) {
        throw new Error(`${axeRuntimeExceptionMsgPrefix} ${e}`);
    }
    if (violations.length > 0) {
        throw new A11yError(violations);
    }
}
