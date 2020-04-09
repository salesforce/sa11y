/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import 'global-jsdom/lib/register'; // https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#required-globals
import * as axe from 'axe-core';
import { a11yResultsFormatter } from '..';

afterEach(() => {
    document.body.innerHTML = ''; // reset dom body
});

describe('a11y Results Formatter', () => {
    it('should format a11y issues as expected', async () => {
        document.body.innerHTML = `<html>
                                    <body>
                                     <a href="#"></a>
                                    </body>
                                   </html>`;
        await axe.run(document).then((results) => {
            expect(results).toBeDefined();
            expect(a11yResultsFormatter(results.violations)).toMatchSnapshot();
        });
    });
});
