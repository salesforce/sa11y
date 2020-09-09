/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { BrowserObject } from 'webdriverio';
import { assertAccessible, assertAccessibleSync } from './wdio';

/**
 * Register sa11y commands on browser, element to check for their accessibility.
 * @param driver - global webdriverIO browser object
 */
export function registerSa11yCommands(driver: BrowserObject = global.browser) {
    // Ref: https://webdriver.io/docs/customcommands.html
    // Define assert Accessible commands on 'browser'
    browser.addCommand('assertAccessible', () => assertAccessible(driver));
    browser.addCommand('assertAccessibleSync', () => assertAccessibleSync(driver));
    // Define assert Accessible commands on 'element'
    browser.addCommand('assertAccessible', () => assertAccessible(driver, this as Promise<Element>), true);
    browser.addCommand('assertAccessibleSync', () => assertAccessibleSync(driver, this as Promise<Element>), true);
}
