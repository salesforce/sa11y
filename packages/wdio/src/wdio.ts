/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as axe from 'axe-core';
import { defaultRuleset } from '@sa11y/preset-rules';
import { A11yError, exceptionListFilter } from '@sa11y/format';
import { A11yConfig, AxeResults, axeVersion, getViolations, WdioOptions, WdioBrowser } from '@sa11y/common';

/**
 * Merge given options with default options
 */
function setDefaultOptions(opts: Partial<WdioOptions> = {}): WdioOptions {
    const defaultOptions: WdioOptions = {
        driver: global.browser, // Need to be defined inside a function as it is populated at runtime
        scope: undefined,
        rules: defaultRuleset,
        exceptionList: {},
    };
    return Object.assign(Object.assign({}, defaultOptions), opts);
}

/**
 * Return version of axe injected into browser
 */
export async function getAxeVersion(driver: WdioBrowser): Promise<typeof axeVersion> {
    return driver.execute(() => {
        return typeof axe === 'object' ? axe.version : undefined;
    });
}

/**
 * Load axe source into browser if it is not already loaded and return version of axe
 */
export async function loadAxe(driver: WdioBrowser): Promise<void> {
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
export async function runAxe(options: Partial<WdioOptions> = {}): Promise<AxeResults> {
    const { driver, scope, rules } = setDefaultOptions(options);
    const elemSelector = scope ? (await scope).selector : undefined;
    await loadAxe(driver);

    // run axe inside browser and return violations
    return (await driver.executeAsync(
        // TODO (chore): Fix lint error
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // TS2345: Argument of type is not assignable to parameter of type
        (elemSelector: string, rules: A11yConfig, done: CallableFunction) => {
            axe.run(
                (elemSelector || document) as axe.ElementContext,
                rules as axe.RunOptions,
                (err: Error, results: axe.AxeResults) => {
                    if (err) throw err;
                    done(results.violations);
                }
            );
        },
        elemSelector,
        rules
    )) as AxeResults;
}

/**
 * Verify that the currently loaded page in the browser is accessible.
 * Throw an error with the accessibility issues found if it is not accessible.
 * Asynchronous version of {@link assertAccessibleSync}
 */
export async function assertAccessible(opts: Partial<WdioOptions> = {}): Promise<void> {
    const options = setDefaultOptions(opts);
    // TODO (feat): Add as custom commands to both browser for page level and elem
    //      https://webdriver.io/docs/customcommands.html
    const violations = await getViolations(() => runAxe(options));
    // TODO (refactor): move exception list filtering to getViolations()
    //  and expose it as an arg to assert and jest api as well ?
    const filteredResults = exceptionListFilter(violations, options.exceptionList);
    A11yError.checkAndThrow(filteredResults);
}

/**
 * Verify that the currently loaded page in the browser is accessible.
 * Throw an error with the accessibility issues found if it is not accessible.
 * Synchronous version of {@link assertAccessible}
 */
export function assertAccessibleSync(opts: Partial<WdioOptions> = {}): void {
    const options = setDefaultOptions(opts);
    // Note: https://github.com/webdriverio/webdriverio/tree/master/packages/wdio-sync#switching-between-sync-and-async
    void options.driver.call(async () => {
        await assertAccessible(options);
    });
}
