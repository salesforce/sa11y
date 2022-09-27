/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as fs from 'fs/promises';
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

async function loadMinJS(filePath = sa11yMinJS): Promise<void> {
    const sa11yMinJsPath = path.resolve(__dirname, filePath);
    const sa11yMinJs = (await fs.readFile(sa11yMinJsPath)).toString();
    if (sa11yMinJs.length <= 0) throw new Error('Unable to load min js ' + filePath);
    return browser.execute(sa11yMinJs);
}

/**
 * Test util function to inject given file and verify that sa11y and axe are loaded into browser
 */
async function verifySa11yLoaded(filePath: string): Promise<void> {
    await browser.reloadSession();
    await loadMinJS(filePath);
    // After injecting sa11y and axe should be defined
    const packageJSON = JSON.parse(
        (await fs.readFile(path.resolve(__dirname, '../package.json'))).toString()
    ) as ObjectWithVersion;
    await expectAsync(isLoaded(namespace)).toBeResolvedTo(packageJSON.version);
    await expectAsync(isLoaded('axe')).toBeResolvedTo(axeVersion);
}

async function checkNumViolations(
    scope = '',
    exceptionList = {},
    expectedNumViolations = a11yIssuesCount,
    script = ''
): Promise<void> {
    const getViolationsScript =
        script ||
        `return JSON.parse((await sa11y.checkAccessibility(
                '${scope}',
                sa11y.base,
                ${JSON.stringify(exceptionList)}))).length;`;
    await browser.url(htmlFileWithNoA11yIssues);
    await loadMinJS();
    await expectAsync(browser.execute(getViolationsScript)).toBeResolvedTo(0);

    await browser.url(htmlFileWithA11yIssues);
    await loadMinJS();
    await expectAsync(browser.execute(getViolationsScript)).toBeResolvedTo(expectedNumViolations);
}

describe('@sa11y/browser-lib', () => {
    it('should not have axe or sa11y loaded to start with', async () => {
        await expectAsync(isLoaded(namespace)).toBeResolvedTo(false);
        await expectAsync(isLoaded('axe')).toBeResolvedTo(false);
    });

    it('should inject minified js', () => verifySa11yLoaded(sa11yMinJS));

    it('should inject un-minified js', () => verifySa11yLoaded(sa11yJS));

    it('should invoke functions on axe e.g. getRules', async () => {
        await loadMinJS();
        return expectAsync(browser.execute('return axe.getRules().length')).toBeResolvedTo(full.runOnly.values.length);
    });

    it('should run a11y checks using axe', () => {
        return checkNumViolations('', {}, a11yIssuesCount, 'return (await axe.run()).violations.length;');
    });

    it('should run a11y checks using sa11y', () => checkNumViolations());

    it('should filter a11y violations using sa11y', () =>
        checkNumViolations('', exceptionList, a11yIssuesCountFiltered));

    it('should analyze only specified scope using sa11y', () => checkNumViolations('div', {}, 1));
});
