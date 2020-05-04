/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

describe('integration test @sa11y/jest', () => {
    it.skip('should have a11y matchers working with setup in jest.config.js', () => {
        // TODO(Fix) : Fails with TypeError: expect(...).toBeAccessible is not a function
        expect(document).toBeAccessible();
    });
});
