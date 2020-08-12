/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import fs from 'fs';
import path from 'path';
import { nameSpace } from '../src';
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

describe('@sa11y/browser-lib', () => {
    it('should inject minified js', () => {
        const sa11yMinJsPath = path.resolve(__dirname, '../dist/sa11y.min.js');
        const sa11yMinJs = fs.readFileSync(sa11yMinJsPath).toString();
        expect(sa11yMinJs.length).toBeGreaterThan(0);

        // Before injecting sa11y min js neither sa11y nor axe should not be defined
        expect(isLoaded(nameSpace)).toBe(false);
        expect(isLoaded('axe')).toBe(false);
        browser.execute(sa11yMinJs);
        // After injecting sa11y and axe should be defined
        // TODO (refactor): Get sa11y version dynamically (from package.json)
        expect(isLoaded(nameSpace)).toEqual('0.1.0-alpha');
        expect(isLoaded('axe')).toEqual(axeVersion);
    });
});
