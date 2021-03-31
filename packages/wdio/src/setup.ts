/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { assertAccessible, assertAccessibleSync, WDIOBrowser } from './wdio';

// https://webdriver.io/docs/typescript#adding-custom-commands
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace WebdriverIO {
        interface Browser {
            assertAccessible: (arg: any) => Promise<void>;
            assertAccessibleSync: (arg: any) => void;
        }

        interface MultiRemoteBrowser {
            assertAccessible: (arg: any) => Promise<void>;
            assertAccessibleSync: (arg: any) => void;
        }

        interface Element {
            assertAccessible: (arg: any) => Promise<void>;
            assertAccessibleSync: (arg: any) => void;
        }
    }
}

/**
 * Register sa11y commands on browser amd element to check for their accessibility.
 * @param driver - global webdriverIO browser object
 */
export function setup(driver: WDIOBrowser = global.browser): void {
    // Ref: https://webdriver.io/docs/customcommands.html
    // Define assert Accessible commands on 'browser'
    browser.addCommand('assertAccessible', () => assertAccessible({ driver }));
    browser.addCommand('assertAccessibleSync', () => assertAccessibleSync({ driver }));

    // Define assert Accessible commands on 'element'
    browser.addCommand(
        'assertAccessible',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        () => assertAccessible({ driver, scope: this as Promise<WebdriverIO.Element> }),
        true
    );

    browser.addCommand(
        'assertAccessibleSync',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        () => assertAccessibleSync({ driver, scope: this as Promise<WebdriverIO.Element> }),
        true
    );
}
