/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as axe from 'axe-core';
import { BrowserObject } from 'webdriverio';
import { A11yConfig, extended } from '@sa11y/preset-rules';
import { A11yError } from '@sa11y/format';
import { getViolations } from '@sa11y/common';

// TODO (refactor): Find a way to declare version into axe namespace
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
// eslint-disable-next-line import/namespace
export const axeVersion: string | undefined = axe.version;

/**
 * Return version of axe injected into browser
 */
export async function getAxeVersion(driver: BrowserObject): Promise<typeof axeVersion> {
    return driver.executeAsync((done) => {
        if (typeof axe !== 'undefined') {
            // TODO (refactor): Find a way to declare version into axe namespace
            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore
            // eslint-disable-next-line import/namespace
            done(axe.version);
        } else {
            done(undefined);
        }
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
export async function runAxe(driver: BrowserObject, rules: A11yConfig = extended): Promise<axe.Result[]> {
    await loadAxe(driver);

    // run axe inside browser and return violations
    return await driver.executeAsync((rules, done) => {
        axe.run(document, rules, function (err: Error, results: axe.AxeResults) {
            if (err) throw err;
            done(results.violations);
        });
    }, rules);
}

/**
 * Verify that the currently loaded page in the browser is accessible.
 * Throw an error with the accessibility issues found if it is not accessible.
 * @param driver - WDIO instance navigated to page to be checked
 * @param rules - a11y preset-rules to be used for checking accessibility
 */
export async function assertAccessible(driver: BrowserObject = browser, rules: A11yConfig = extended): Promise<void> {
    // TODO (feat): Add as custom commands to both browser for page level and elem
    //      https://webdriver.io/docs/customcommands.html
    const violations = await getViolations(() => runAxe(driver, rules));
    A11yError.checkAndThrow(violations);
}
