/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from 'fs';
import axe from 'axe-core';
import { registerCustomRules } from '../src/customRules'; // Adjust the path to your file

jest.mock('fs');
jest.mock('axe-core');

describe('registerCustomRules', () => {
    const mockReadFileSync = fs.readFileSync as jest.MockedFunction<typeof fs.readFileSync>;
    const mockReaddirSync = fs.readdirSync as jest.MockedFunction<typeof fs.readdirSync>;
    const mockConfigure = axe.configure as jest.MockedFunction<typeof axe.configure>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should register custom rules and checks correctly', () => {
        const mockRules = [{ id: 'rule2', selector: 'selector1' }];
        const mockChecks = [{ id: 'check1', evaluate: 'evaluate1' }];

        mockReadFileSync.mockImplementation((filePath: string): string => {
            if (filePath.includes('changes.json')) {
                return JSON.stringify({ rules: mockRules });
            } else if (filePath.includes('checks')) {
                return JSON.stringify(mockChecks[0]);
            } else if (filePath.includes('rules')) {
                return JSON.stringify(mockRules[0]);
            }
            throw new Error('Unexpected file path');
        });

        mockReaddirSync.mockImplementation((dirPath: string): string[] => {
            if (dirPath.includes('checks')) {
                return ['check1.json'];
            } else if (dirPath.includes('rules')) {
                return ['rule1.json'];
            }
            return [];
        });

        registerCustomRules();

        expect(mockConfigure).toHaveBeenCalledWith({
            rules: mockRules.concat(mockRules),
            checks: mockChecks,
        });
    });

    it('should log an error if reading files fails', () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

        mockReadFileSync.mockImplementation(() => {
            throw new Error('File read error');
        });

        registerCustomRules();

        expect(consoleErrorSpy).toHaveBeenCalledWith('Error in reading Custom Rules files: ', 'File read error');

        consoleErrorSpy.mockRestore();
    });
});
