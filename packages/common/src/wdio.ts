/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { A11yConfig } from './axe';
import { ExceptionList } from './format';

/**
 * Optional arguments passed to WDIO APIs
 * @param driver - WDIO {@link WebdriverIO.Browser} instance navigated to the page to be checked. Created automatically by WDIO test runner. Might need to be passed in explicitly when other test runners are used.
 * @param scope - Element to check for accessibility found using [`browser.$(selector)`](https://webdriver.io/docs/selectors), defaults to the entire document.
 * @param rules - {@link A11yConfig} to be used for checking accessibility. Defaults to {@link base}
 * @param exceptionList - map of rule id to corresponding CSS targets that needs to be filtered from results
 */
export type WdioOptions = {
    driver: WebdriverIO.Browser;
    scope?: Promise<WebdriverIO.Element> | WebdriverIO.Element;
    rules?: A11yConfig;
    exceptionList?: ExceptionList;
};

export type WdioAssertFunction = (opts: Partial<WdioOptions>) => void | Promise<void>;
