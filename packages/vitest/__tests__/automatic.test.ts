/*
 * Copyright (c) 2026, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { afterEach as vitestAfterEach, beforeEach as vitestBeforeEach } from 'vitest';
import { defaultAutoCheckOpts, defaultRenderedDOMSaveOpts, runAutomaticCheck } from '@sa11y/matcher';
import { registerSa11yAutomaticChecks } from '../src/automatic';
import { isTestUsingFakeTimer } from '../src/matcher';
import { setup } from '../src/setup';

// Vitest's hooks and expect are only available in a Vitest test run
jest.mock('vitest', () => ({
    beforeEach: jest.fn(),
    afterEach: jest.fn(),
    expect: { extend: jest.fn(), getState: () => ({ testPath: 'foo.test.ts', currentTestName: 'foo' }) },
}));
jest.mock('@sa11y/matcher', () => ({
    ...jest.requireActual<object>('@sa11y/matcher'),
    runAutomaticCheck: jest.fn(),
}));

/**
 * Run the beforeEach and afterEach hooks registered with Vitest
 */
async function runRegisteredHooks(): Promise<void> {
    for (const registerHook of [vitestBeforeEach, vitestAfterEach]) {
        for (const [hook] of jest.mocked(registerHook).mock.calls) {
            await (hook as () => unknown)();
        }
    }
}

describe('automatic checks registration', () => {
    const prevEnv = process.env;
    const observeSpy = jest.spyOn(MutationObserver.prototype, 'observe');

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...prevEnv };
    });

    afterAll(() => {
        jest.restoreAllMocks();
        process.env = prevEnv;
    });

    it('should not register checks when not opted in', () => {
        registerSa11yAutomaticChecks({ ...defaultAutoCheckOpts, runAfterEach: false });
        expect(vitestAfterEach).not.toHaveBeenCalled();
    });

    it('should run checks without DOM mutation observer when opted in', async () => {
        registerSa11yAutomaticChecks({ ...defaultAutoCheckOpts, runDOMMutationObserver: true });
        await runRegisteredHooks();
        expect(observeSpy).not.toHaveBeenCalled();
        expect(runAutomaticCheck).toHaveBeenCalledWith(
            expect.objectContaining({ runAfterEach: true, runDOMMutationObserver: false }),
            defaultRenderedDOMSaveOpts,
            'foo.test.ts',
            'foo',
            isTestUsingFakeTimer
        );
    });

    it('should run checks without DOM mutation observer when opted in with env var', async () => {
        process.env.SA11Y_AUTO = '1';
        process.env.SA11Y_ENABLE_DOM_MUTATION_OBSERVER = '1';
        setup({ autoCheckOpts: {}, renderedDOMSaveOpts: {} });
        await runRegisteredHooks();
        expect(observeSpy).not.toHaveBeenCalled();
        expect(runAutomaticCheck).toHaveBeenCalledWith(
            expect.objectContaining({ runAfterEach: true, runDOMMutationObserver: false }),
            {},
            'foo.test.ts',
            'foo',
            isTestUsingFakeTimer
        );
    });
});
