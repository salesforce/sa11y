/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import fs from 'fs';
import path from 'path';

describe('@sa11y/browser-lib', () => {
    it('should inject minified js', async () => {
        const sa11yMinJsPath = path.resolve(__dirname, '../dist/sa11y.min.js');
        const sa11yMinJs = fs.readFileSync(sa11yMinJsPath).toString();
        expect(sa11yMinJs.length).toBeGreaterThan(0);

        await browser.execute(sa11yMinJs);
        const loaded = await driver.executeAsync((done) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore
            // eslint-disable-next-line import/namespace
            done(typeof sa11y === 'object');
        });
        expect(loaded).toBe(true);
    });
});
