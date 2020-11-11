/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { BrowserObject, remote, RemoteOptions } from 'webdriverio';

export const defaultJestTimeout = 5000; // Is there a way to get this dynamically ?

export async function setupWDIO(): Promise<void> {
    jest.setTimeout(defaultJestTimeout * 10); // Increase timeout for WebdriverIO tests
    if (!global.browser) global.browser = await getBrowser();
}

export async function teardownWDIO(): Promise<void> {
    jest.setTimeout(defaultJestTimeout);
    if (global.browser) {
        const browser = global.browser;
        // Note: deleteSession() doesn't clear the browser instance immediately.
        //  browser.status() hangs after deleteSession is called.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        global.browser = undefined;
        // TODO (fix): Jest warning: "A worker process has failed to exit gracefully and has been force exited. This is likely caused by tests leaking due to improper teardown. Try running with --runInBand --detectOpenHandles to find leaks."
        await browser.deleteSession();
    }
}

export async function getBrowser(debug = false): Promise<BrowserObject> {
    // Ref: https://www.npmjs.com/package/@wdio/sync#using-webdriverio-as-standalone-package
    return await remote(getConfigWDIO(debug));
}

export function getConfigWDIO(debug = false): RemoteOptions {
    // TODO (refactor): Is there a way to reuse the config object from wdio.conf.js here ?
    //  https://webdriver.io/docs/typescript.html#typed-configuration
    // const config = require('../../../wdio.conf.js');
    return {
        runner: 'local',
        specs: ['__tests__/**/*.ts'],
        filesToWatch: ['src/**/*.ts'],
        maxInstances: debug ? 1 : 10,
        // TODO (chore): "capabilities" is an object in RemoteOptions but an array in Config. Clarify if this is expected.
        capabilities: {
            maxInstances: debug ? 1 : 5,
            browserName: 'chrome',
            'goog:chromeOptions': {
                // https://developers.google.com/web/updates/2017/04/headless-chrome)
                args: debug ? [] : ['--headless', '--disable-gpu'],
            },
        },
        // Additional list of node arguments to use when starting child processes
        execArgv: debug ? ['--inspect', '--trace-warnings'] : ['--unhandled-rejections=strict'],
        // Level of logging verbosity: trace | debug | info | warn | error | silent
        logLevel: debug ? 'debug' : 'error',
        outputDir: debug ? '/tmp/wdio/' : '',
        bail: debug ? 1 : 0,
        baseUrl: 'http://localhost',
        // Default timeout for all waitFor* commands.
        waitforTimeout: 10000,
        // Default timeout in milliseconds for request
        // if browser driver or grid doesn't send response
        connectionRetryTimeout: 120000,
        // Default request retries count
        connectionRetryCount: 3,
        services: ['chromedriver'],
        framework: 'mocha',
        reporters: ['spec'],
        // Options to be passed to Mocha.
        // See the full list at http://mochajs.org/
        // TODO (chore): file issue with WDIO for missing type def
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore mochaOpts doesn't exist in webdriverIO Config type
        mochaOpts: {
            // TypeScript setup
            // TODO (refactor): Can we reuse babel instead https://webdriver.io/docs/babel.html
            //  https://github.com/webdriverio/webdriverio/issues/5588
            require: ['ts-node/register'],
            ui: 'bdd',
            timeout: debug ? 600000000 : 60000,
        },
    };
}
