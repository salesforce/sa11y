/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import axe from 'axe-core';
import { registerCustomRules } from '../src/customRules';
import checkData from '../src/custom-rules/checks';
import rulesData from '../src/custom-rules/rules';
import changes from '../src/custom-rules/changes';

jest.mock('axe-core');

describe('registerCustomRules', () => {
    const mockConfigure = axe.configure as jest.MockedFunction<typeof axe.configure>;

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should configure axe with new checks and rules', () => {
        registerCustomRules();
        const changedRules = changes?.rules ?? [];
        expect(mockConfigure).toHaveBeenCalledWith({
            rules: [...changedRules, ...rulesData],
            checks: [...checkData],
        });
    });
});
