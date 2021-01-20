/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as fs from 'fs';
import * as path from 'path';
import { namespace } from '../src';
import { axeVersion } from '@sa11y/common';
import { full } from '@sa11y/preset-rules';
import {
    a11yIssuesCountFiltered,
    exceptionList,
    htmlFileWithNoA11yIssues,
    htmlFileWithA11yIssues,
    a11yIssuesCount,
} from '@sa11y/test-utils';

type ObjectWithVersion = {
    version: string;
};

const sa11yJS = '../dist/sa11y.js';
const sa11yMinJS = '../dist/sa11y.min.js';

// TODO (refactor): reuse common code with @sa11y/wdio src/test code

/**
 * Test util function to check if given object with 'version' property is loaded in browser.
 * @returns value of given object's 'version' property if available, false otherwise.
 */
function isLoaded(objName: string): Promise<string | boolean> {
    return browser.execute((objName) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
        const obj: ObjectWithVersion = (window as { [key: string]: any })[objName];
        return typeof obj === 'object' ? obj.version : false;
    }, objName);
}

function loadMinJS(filePath = sa11yMinJS): void {
    const sa11yMinJsPath = path.resolve(__dirname, filePath);
    const sa11yMinJs = fs.readFileSync(sa11yMinJsPath).toString();
    if (sa11yMinJs.length <= 0) throw new Error('Unable to load min js ' + filePath);
    void browser.execute(sa11yMinJs);
}

/**
 * Test util function to inject given file and verify that sa11y and axe are loaded into browser
 */
function verifySa11yLoaded(filePath: string): void {
    void browser.reloadSession();
    loadMinJS(filePath);
    // After injecting sa11y and axe should be defined
    const packageJSON = JSON.parse(
        fs.readFileSync(path.resolve(__dirname, '../package.json')).toString()
    ) as ObjectWithVersion;
    expect(isLoaded(namespace)).toEqual(packageJSON.version);
    expect(isLoaded('axe')).toEqual(axeVersion);
}

function checkNumViolations(script: string, expectedNumViolations = a11yIssuesCount): void {
    void browser.url(htmlFileWithNoA11yIssues);
    loadMinJS();
    expect(browser.execute(script)).toBe(0);

    void browser.url(htmlFileWithA11yIssues);
    loadMinJS();
    expect(browser.execute(script)).toBe(expectedNumViolations);
}

function getSa11yScript(exceptionList = {}) {
    return `return JSON.parse((await sa11y.checkAccessibility(sa11y.recommended, ${JSON.stringify(
        exceptionList
    )}))).length;`;
}

describe('@sa11y/browser-lib', () => {
    it('should not have axe or sa11y loaded to start with', () => {
        expect(isLoaded(namespace)).toBe(false);
        expect(isLoaded('axe')).toBe(false);
    });

    // eslint-disable-next-line jest/expect-expect
    it('should inject minified js', () => {
        verifySa11yLoaded(sa11yMinJS);
    });

    // eslint-disable-next-line jest/expect-expect
    it('should inject un-minified js', () => {
        verifySa11yLoaded(sa11yJS);
    });

    it('should invoke functions on axe e.g. getRules', () => {
        loadMinJS();
        expect(browser.execute('return axe.getRules().length')).toEqual(full.runOnly.values.length);
    });

    // eslint-disable-next-line jest/expect-expect
    it('should run a11y checks using axe', () => {
        checkNumViolations('return (await axe.run()).violations.length;');
    });

    // eslint-disable-next-line jest/expect-expect
    it('should run a11y checks using sa11y', () => {
        checkNumViolations(getSa11yScript());
    });

    // eslint-disable-next-line jest/expect-expect
    it('should filter a11y violations using sa11y', () => {
        checkNumViolations(getSa11yScript(exceptionList), a11yIssuesCountFiltered);
    });
});
