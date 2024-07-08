/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import path from 'path';
import { useFilesToBeExempted, log, useCustomRules, processFiles, registerCustomRules } from '../src/helpers';
import axe from 'axe-core';
jest.mock('axe-core');

describe('Your Module', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should log messages when SA11Y_DEBUG is set', () => {
        const originalEnv = process.env.SA11Y_DEBUG;
        process.env.SA11Y_DEBUG = 'true';

        const consoleSpy = jest.spyOn(console, 'log');
        log('Test Log Message');

        expect(consoleSpy).toHaveBeenCalledWith('♿[Sa11y]', 'Test Log Message');

        process.env.SA11Y_DEBUG = originalEnv; // Restore original environment variable
    });

    it('should return an empty array if packageName is not set', () => {
        const result = useFilesToBeExempted();

        expect(result).toEqual([]);
    });

    it('should return an empty array if SA11Y_AUTO_FILTER_LIST_PACKAGE_REQUIREMENT is not set', () => {
        process.env.SA11Y_AUTO_FILTER_LIST_PACKAGE_NAME = 'somePackage';
        process.env.SA11Y_AUTO_FILTER_LIST_PACKAGE_REQUIREMENT = '';

        const result = useFilesToBeExempted();

        expect(result).toEqual([]);

        // Cleanup
        delete process.env.SA11Y_AUTO_FILTER_LIST_PACKAGE_REQUIREMENT;
        delete process.env.SA11Y_AUTO_FILTER_LIST_PACKAGE_NAME;
    });

    it('should use the package if packageName is set', () => {
        const packageName = '../testMocks/packageTestHelper.ts';
        process.env.SA11Y_AUTO_FILTER_LIST_PACKAGE_NAME = packageName;

        const result = useFilesToBeExempted();

        expect(result).toEqual(['file1', 'file2']);

        // Cleanup
        delete process.env.SA11Y_AUTO_FILTER_LIST_PACKAGE_NAME;
    });

    it('no package  found if packageName is set', () => {
        const packageName = '../testMocks/packageTestHelperWrong.ts';

        process.env.SA11Y_AUTO_FILTER_LIST_PACKAGE_NAME = packageName;

        const result = useFilesToBeExempted();

        expect(result).toEqual([]);

        delete process.env.SA11Y_AUTO_FILTER_LIST_PACKAGE_NAME;
    });

    it('empty array if packageName is not set', () => {
        const result = useFilesToBeExempted();

        expect(result).toEqual([]);
    });

    it('should return empty array if SA11Y_CUSTOM_RULES env variable is not set', () => {
        process.env.SA11Y_CUSTOM_RULES = '';
        const result = useCustomRules();
        expect(result).toEqual([]);
    });

    it('should return empty array if reading file encounters an error', () => {
        process.env.SA11Y_CUSTOM_RULES = 'packages/common/testMocks/WrongFile.json';
        const result = useCustomRules();
        expect(result).toEqual([]);
    });

    it('should return rules array if file is read successfully', () => {
        process.env.SA11Y_CUSTOM_RULES = 'packages/common/testMocks/sa11y-custom-rules.json';
        const mockRules = ['rule1', 'rule2'];
        const result = useCustomRules();
        expect(result).toEqual(mockRules);
    });

    it('should return empty array if custom rules path is empty', () => {
        delete process.env.SA11Y_CUSTOM_RULES;
        const result = useCustomRules();
        expect(result).toEqual([]);
    });

    it('should process only .json files and parse their content', () => {
        const targetArray: Array<{ key: string }> = [];
        const directoryPath = path.join(__dirname, '../testMocks/testProcessFiles');
        processFiles<{ key: string }>(directoryPath, targetArray, '.json', JSON.parse);
        expect(targetArray).toEqual([{ key: 'value' }]);
    });

    it('register custom Rules', () => {
        const mockConfigure = axe.configure as jest.MockedFunction<typeof axe.configure>;
        const mockRules = [{ id: 'rule1' }] as axe.Rule[];
        const mockChecks = [{ id: 'check1' }] as axe.Check[];
        const mockChanges = { rules: [{ id: 'rule2' }] } as { rules: axe.Rule[] };
        registerCustomRules(mockChanges, mockRules, mockChecks);
        expect(mockConfigure).toHaveBeenCalledWith({
            rules: [...mockChanges.rules, ...mockRules],
            checks: [...mockChecks],
        });
    });
});
