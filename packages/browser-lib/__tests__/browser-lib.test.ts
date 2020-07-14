/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import fs from 'fs';
import path from 'path';

async function isSa11yLoaded(): Promise<string | boolean> {
    return await browser.execute(() => {
        // TODO (refactor): Find a way to declare sa11y namespace
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        // eslint-disable-next-line import/namespace
        return typeof sa11y === 'object' ? sa11y.version : false;
    });
}

describe('@sa11y/browser-lib', () => {
    it('should inject minified js', async () => {
        const sa11yMinJsPath = path.resolve(__dirname, '../dist/sa11y.min.js');
        const sa11yMinJs = fs.readFileSync(sa11yMinJsPath).toString();
        expect(sa11yMinJs.length).toBeGreaterThan(0);

        // Before injecting sa11y min js it should not be defined
        expect(await isSa11yLoaded()).toBe(false);
        await browser.execute(sa11yMinJs);
        // After injecting it should be defined
        expect(await isSa11yLoaded()).toBeTruthy();
    });
});
