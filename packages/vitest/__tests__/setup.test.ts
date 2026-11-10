/*
 * Copyright (c) 2026, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { afterEach as vitestAfterEach, beforeEach as vitestBeforeEach } from 'vitest';
import type { RunnerTaskResult, RunnerTestCase } from 'vitest';
import { getCurrentTest } from 'vitest/suite';
import { getOriginalDocumentBodyHtml, setOriginalDocumentBodyHtml } from '@sa11y/matcher';
import { setup } from '../src/setup';

const mockTestState = { testPath: 'foo.test.ts', currentTestName: 'foo' };

// Vitest's hooks, expect and current test are only available in a Vitest test run
jest.mock('vitest', () => ({
    beforeEach: jest.fn(),
    afterEach: jest.fn(),
    expect: { extend: jest.fn(), getState: () => mockTestState },
}));
jest.mock('vitest/suite', () => ({ getCurrentTest: jest.fn() }));

/**
 * Set the result of the current Vitest test
 */
function setTestResult(result?: Partial<RunnerTaskResult>): void {
    jest.mocked(getCurrentTest).mockReturnValue(result && ({ result } as RunnerTestCase));
}

/**
 * Run the hooks registered with Vitest
 */
async function runHooks(registerHook: typeof vitestBeforeEach | typeof vitestAfterEach): Promise<void> {
    for (const [hook] of jest.mocked(registerHook).mock.calls) {
        await (hook as () => unknown)();
    }
}

/**
 * Remove all nodes from the body, like the cleanup of a testing library
 */
function cleanup(): void {
    while (document.body.firstChild) document.body.removeChild(document.body.firstChild);
}

/**
 * Run a test like Vitest, with the DOM cleaned up by an afterEach hook running before the automatic checks,
 * like the cleanup of a testing library registered after the Sa11y setup.
 */
async function runTest(testName: string, testFn: () => void): Promise<void> {
    mockTestState.currentTestName = testName;
    const result: Partial<RunnerTaskResult> = { state: 'run', hooks: { beforeEach: 'run' } };
    setTestResult(result);
    await runHooks(vitestBeforeEach);
    result.hooks = { beforeEach: 'pass' };
    testFn();
    result.state = 'pass';
    result.hooks.afterEach = 'run';
    cleanup();
    await runHooks(vitestAfterEach);
}

/**
 * Create an element with the given attributes and text
 */
function createElement(tagName: string, attributes: Record<string, string> = {}, text = ''): HTMLElement {
    const element = document.createElement(tagName);
    for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
    element.textContent = text;
    return element;
}

/**
 * Render the given element in a container appended to the body
 */
function render(element: HTMLElement): HTMLElement {
    const container = document.createElement('div');
    container.appendChild(element);
    document.body.appendChild(container);
    return container;
}

/**
 * Re-render the given container with the given element, removing its current nodes like a component update
 */
function reRender(container: HTMLElement, element: HTMLElement): void {
    while (container.firstChild) container.removeChild(container.firstChild);
    container.appendChild(element);
}

const image = (id: string) => createElement('img', { id, src: 'photo.png' });
const paragraph = (text: string) => createElement('p', {}, text);

describe('automatic checks DOM lifecycle', () => {
    const prevEnv = process.env;
    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...prevEnv, SA11Y_AUTO: '1' };
    });

    afterEach(() => {
        // Remove the patched removeChild, falling back to the one of Node
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        delete (Element.prototype as any).removeChild;
        setOriginalDocumentBodyHtml(null);
        cleanup();
    });

    afterAll(() => {
        process.env = prevEnv;
    });

    it('should check the final DOM of a test fixing a11y issues during the test', async () => {
        setup({ autoCheckOpts: {}, renderedDOMSaveOpts: {} });
        await expect(
            runTest('fixes a11y issues', () => {
                reRender(render(image('spinner-fixed')), paragraph('Loaded'));
            })
        ).resolves.toBeUndefined();
    });

    it('should check the final DOM of a test adding a11y issues during the test', async () => {
        setup({ autoCheckOpts: {}, renderedDOMSaveOpts: {} });
        await expect(
            runTest('adds a11y issues', () => {
                reRender(render(paragraph('Loading')), image('photo-added'));
            })
        ).rejects.toThrow('1 Accessibility');
    });

    it('should check the DOM of a test not cleaned up before the automatic checks', async () => {
        setup({ autoCheckOpts: {}, renderedDOMSaveOpts: {} });
        setTestResult({ state: 'run', hooks: { beforeEach: 'pass' } });
        await runHooks(vitestBeforeEach);
        reRender(render(paragraph('Loading')), image('photo-no-cleanup'));
        setTestResult({ state: 'pass', hooks: { beforeEach: 'pass', afterEach: 'run' } });
        await expect(runHooks(vitestAfterEach)).rejects.toThrow('1 Accessibility');
    });

    it('should not check the DOM of a previous test with skipped automatic checks', async () => {
        process.env.SA11Y_AUTO_FILTER_TESTS = 'skipped';
        setup({ autoCheckOpts: {}, renderedDOMSaveOpts: {} });
        await runTest('skipped test', () => {
            render(image('photo-skipped'));
        });
        expect(getOriginalDocumentBodyHtml()).toContain('photo-skipped');
        await expect(
            runTest('next test', () => {
                render(paragraph('Accessible'));
            })
        ).resolves.toBeUndefined();
    });

    it.each([
        ['outside of a test', undefined],
        ['during a test', { state: 'run' }],
        ['during a test with a failed soft assertion', { state: 'fail' }],
        ['during a retried test', { state: 'run', hooks: { afterEach: 'pass' } }],
        ['during a test retried after failed afterEach hooks', { state: 'run', hooks: { afterEach: 'run' } }],
        ['after the afterEach hooks', { state: 'pass', hooks: { afterEach: 'pass' } }],
    ] as [string, Partial<RunnerTaskResult> | undefined][])(
        'should not save the DOM when removing nodes %s',
        (_, result) => {
            setup({ autoCheckOpts: {}, renderedDOMSaveOpts: {} });
            setTestResult(result);
            reRender(render(paragraph('Loading')), paragraph('Loaded'));
            expect(getOriginalDocumentBodyHtml()).toBeNull();
        }
    );

    it.each(['pass', 'fail'] as const)(
        'should save the DOM when removing nodes in afterEach hooks of a test with state %s',
        (state) => {
            setup({ autoCheckOpts: {}, renderedDOMSaveOpts: {} });
            setTestResult({ state, hooks: { beforeEach: 'pass', afterEach: 'run' } });
            render(paragraph('Loaded'));
            const renderedDOM = document.body.innerHTML;
            cleanup();
            expect(getOriginalDocumentBodyHtml()).toBe(renderedDOM);
        }
    );

    it('should not save the DOM without automatic checks', () => {
        delete process.env.SA11Y_AUTO;
        setup({ autoCheckOpts: {}, renderedDOMSaveOpts: {} });
        expect(vitestBeforeEach).not.toHaveBeenCalled();
        setTestResult({ state: 'pass', hooks: { afterEach: 'run' } });
        render(paragraph('Loaded'));
        cleanup();
        expect(getOriginalDocumentBodyHtml()).toBeNull();
    });
});
