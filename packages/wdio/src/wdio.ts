/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as axe from 'axe-core';
import { BrowserObject } from 'webdriverio';
import { A11yConfig, recommended } from '@sa11y/preset-rules';
import { A11yError } from '@sa11y/format';
import { getViolations } from '@sa11y/common';

export const axeVersion: string | undefined = axe.version;

/**
 * Return version of axe injected into browser
 */
export async function getAxeVersion(driver: BrowserObject): Promise<typeof axeVersion> {
    return driver.execute(() => {
        return typeof axe === 'object' ? axe.version : undefined;
    });
}

/**
 * Load axe source into browser if it is not already loaded and return version of axe
 */
export async function loadAxe(driver: BrowserObject): Promise<void> {
    if ((await getAxeVersion(driver)) !== axeVersion) {
        await driver.execute(axe.source);
    }

    if ((await getAxeVersion(driver)) !== axeVersion) {
        throw new Error('Unable to load axe');
    }
}

/**
 * Load and run axe in given WDIO instance and return the accessibility violations found.
 */
export async function runAxe(driver: BrowserObject, rules: A11yConfig = recommended): Promise<axe.Result[]> {
    await loadAxe(driver);

    // run axe inside browser and return violations
    return (await driver.executeAsync((rules, done: CallableFunction) => {
        axe.run(document, rules, (err: Error, results: axe.AxeResults) => {
            if (err) throw err;
            done(results.violations);
        });
    }, rules)) as axe.Result[];
}

/**
 * Verify that the currently loaded page in the browser is accessible.
 * Throw an error with the accessibility issues found if it is not accessible.
 * Asynchronous version of {@link assertAccessibleSync}
 * @param driver - WDIO browser instance navigated to page to be checked
 * @param rules - a11y preset-rules to be used for checking accessibility
 */
export async function assertAccessible(
    driver: BrowserObject = browser,
    rules: A11yConfig = recommended
): Promise<void> {
    // TODO (feat): Add as custom commands to both browser for page level and elem
    //      https://webdriver.io/docs/customcommands.html
    const violations = await getViolations(() => runAxe(driver, rules));
    A11yError.checkAndThrow(violations);
}

/**
 * Verify that the currently loaded page in the browser is accessible.
 * Throw an error with the accessibility issues found if it is not accessible.
 * Synchronous version of {@link assertAccessible}
 * @param driver - WDIO browser instance navigated to page to be checked
 * @param rules - a11y preset-rules to be used for checking accessibility
 */
export function assertAccessibleSync(driver: BrowserObject = browser, rules: A11yConfig = recommended): void {
    // Note: https://github.com/webdriverio/webdriverio/tree/master/packages/wdio-sync#switching-between-sync-and-async
    void driver.call(async () => {
        await assertAccessible(driver, rules);
    });
}
