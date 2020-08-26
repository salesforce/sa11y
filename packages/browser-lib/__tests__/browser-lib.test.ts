/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import fs from 'fs';
import path from 'path';
import { namespace } from '../src';
import { axeVersion } from '@sa11y/common';

type objectWithVersion = {
    version: string;
};

/**
 * Test util function to check if given object with 'version' property is loaded in browser.
 * @returns value of given object's 'version' property if available, false otherwise.
 */
function isLoaded(objName: string): Promise<string | boolean> {
    return browser.execute((objName) => {
        const obj: objectWithVersion = (window as { [key: string]: any })[objName];
        return typeof obj === 'object' ? obj.version : false;
    }, objName);
}

/**
 * Test util function to inject given file and verify that sa11y and axe are loaded into browser
 */
function verifySa11yLoaded(filePath: string): void {
    const sa11yMinJsPath = path.resolve(__dirname, filePath);
    const sa11yMinJs = fs.readFileSync(sa11yMinJsPath).toString();
    expect(sa11yMinJs.length).toBeGreaterThan(0);

    // Before injecting sa11y min js neither sa11y nor axe should not be defined
    browser.reloadSession();
    expect(isLoaded(namespace)).toBe(false);
    expect(isLoaded('axe')).toBe(false);
    browser.execute(sa11yMinJs);
    // After injecting sa11y and axe should be defined
    const packageJSON = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json')).toString());
    expect(isLoaded(namespace)).toEqual(packageJSON.version);
    expect(isLoaded('axe')).toEqual(axeVersion);
}

describe('@sa11y/browser-lib', () => {
    // eslint-disable-next-line jest/expect-expect
    it('should inject minified js', () => {
        verifySa11yLoaded('../dist/sa11y.min.js');
    });

    // eslint-disable-next-line jest/expect-expect
    it('should inject un-minified js', () => {
        verifySa11yLoaded('../dist/sa11y.js');
    });
});
