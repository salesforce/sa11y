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
import { axeVersion, getViolations } from '@sa11y/common';

/**
 * Optional arguments passed to WDIO APIs
 * @param driver - WDIO {@link BrowserObject} instance navigated to the page to be checked.
 *  Created automatically by WDIO test runner. Might need to be passed in explicitly with other test runners.
 * @param context - CSS selector of element(s) to check for accessibility, defaults to the entire document
 * @param rules - {@link A11yConfig} to be used for checking accessibility. Defaults to {@link recommended}
 */
export interface Options {
    driver: WebdriverIO.BrowserObject;
    context?: Promise<WebdriverIO.Element>;
    rules?: A11yConfig;
}

/**
 * Merge given options with default options
 */
function setDefaultOptions(opts: Partial<Options> = {}): Options {
    const defaultOptions: Options = {
        driver: global.browser, // Need to be defined inside a function as it is defined at runtime
        context: undefined,
        rules: recommended,
    };
    return Object.assign(Object.assign({}, defaultOptions), opts);
}

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
export async function runAxe(options: Partial<Options> = {}): Promise<axe.Result[]> {
    const { driver, context, rules } = setDefaultOptions(options);
    const elemContext = context ? (await context).selector : undefined;

    await loadAxe(driver);

    // run axe inside browser and return violations
    return (await driver.executeAsync(
        (elemContext, rules, done: CallableFunction) => {
            axe.run((elemContext || document) as axe.ElementContext, rules as axe.RunOptions, function (
                err: Error,
                results: axe.AxeResults
            ) {
                if (err) throw err;
                done(results.violations);
            });
        },
        elemContext,
        rules
    )) as axe.Result[];
}

/**
 * Verify that the currently loaded page in the browser is accessible.
 * Throw an error with the accessibility issues found if it is not accessible.
 * Asynchronous version of {@link assertAccessibleSync}
 */
export async function assertAccessible(opts: Partial<Options> = {}): Promise<void> {
    const options = setDefaultOptions(opts);
    const violations = await getViolations(() => runAxe(options));
    A11yError.checkAndThrow(violations);
}

/**
 * Verify that the currently loaded page in the browser is accessible.
 * Throw an error with the accessibility issues found if it is not accessible.
 * Synchronous version of {@link assertAccessible} to be used with `@wdio/sync` package.
 */
export function assertAccessibleSync(opts: Partial<Options> = {}): void {
    const options = setDefaultOptions(opts);
    // Note: https://github.com/webdriverio/webdriverio/tree/master/packages/wdio-sync#switching-between-sync-and-async
    void options.driver.call(async () => {
        await assertAccessible(options);
    });
}
