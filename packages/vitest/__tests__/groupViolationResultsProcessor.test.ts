/*
 * Copyright (c) 2026, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import type { RunnerTask, RunnerTestCase, RunnerTestFile, RunnerTestSuite } from 'vitest/node';
import { A11yError } from '@sa11y/format';
import { processA11yDetailsAndMessages, runA11yCheck } from '@sa11y/matcher';
import { vitestResultsProcessor } from '../src/groupViolationResultsProcessor';

type State = 'pass' | 'fail' | 'skip';

let a11yError: A11yError;
let groupedMessage: string;

/**
 * Errors reach a reporter serialized from the test worker as plain objects without their prototype,
 * along with their parsed stack frames
 */
function serialize(error: Error): Record<string, unknown> {
    return {
        ...(JSON.parse(JSON.stringify(error)) as Record<string, unknown>),
        name: error.name,
        message: error.message,
        stack: error.stack,
        stacks: [{ method: 'checkAndThrow', file: '/sa11y/packages/format/src/format.ts', line: 1, column: 1 }],
    };
}

function createResult(state?: State, errors?: Error[]) {
    return state && { state, errors: errors?.map(serialize) };
}

function createTest(name: string, state?: State, errors?: Error[]): RunnerTestCase {
    return { type: 'test', name, result: createResult(state, errors) } as unknown as RunnerTestCase;
}

function createSuite(name: string, tasks: RunnerTask[], state?: State, errors?: Error[]): RunnerTestSuite {
    return { type: 'suite', name, tasks, result: createResult(state, errors) } as unknown as RunnerTestSuite;
}

function createFile(tasks: RunnerTask[], state?: State): RunnerTestFile {
    return createSuite('sa11y.test.ts', tasks, state) as RunnerTestFile;
}

beforeAll(async () => {
    // Image without alt text
    document.body.appendChild(document.createElement('img'));
    ({ a11yError } = await runA11yCheck(document));
    const a11yFailureMessages: string[] = [];
    processA11yDetailsAndMessages(a11yError, a11yFailureMessages);
    groupedMessage = a11yFailureMessages[0];
});

describe('Vitest Group Violation Results Processor', () => {
    it('should replace the message and stack of a11y errors with grouped violations', () => {
        const test = createTest('a11y', 'fail', [a11yError]);
        const testFiles = [createFile([test])];

        expect(vitestResultsProcessor(testFiles)).toBe(testFiles);
        expect(a11yError.length).toBeGreaterThan(0);
        expect(test.result?.state).toBe('fail');
        expect(test.result?.errors).toHaveLength(1);
        expect(test.result?.errors?.[0]).toMatchObject({
            name: A11yError.name,
            message: groupedMessage,
            stack: groupedMessage,
            stacks: [],
        });
    });

    it('should only keep a11y errors of a test failing with other errors as well', () => {
        const test = createTest('a11y and other', 'fail', [new Error('foo'), a11yError, a11yError]);

        vitestResultsProcessor([createFile([test])]);

        const expectedError = { name: A11yError.name, message: groupedMessage };
        expect(test.result?.state).toBe('fail');
        expect(test.result?.errors).toMatchObject([expectedError, expectedError]);
    });

    it('should mark tests failing without a11y errors as passed', () => {
        const tests = [createTest('other', 'fail', [new Error('foo')]), createTest('no errors', 'fail')];

        vitestResultsProcessor([createFile(tests)]);

        expect(tests.map((test) => test.result)).toEqual([
            { state: 'pass', errors: [] },
            { state: 'pass', errors: [] },
        ]);
    });

    it('should process tests nested in suites', () => {
        const a11yTest = createTest('a11y', 'fail', [a11yError]);
        const otherTest = createTest('other', 'fail', [new Error('foo')]);
        const testFile = createFile([createSuite('outer', [createSuite('inner', [a11yTest]), otherTest])]);

        vitestResultsProcessor([testFile]);

        expect(a11yTest.result?.errors?.[0]).toMatchObject({ name: A11yError.name, message: groupedMessage });
        expect(otherTest.result?.state).toBe('pass');
        expect(otherTest.result?.errors).toEqual([]);
    });

    it('should mark suites failing only due to tests marked as passed as passed', () => {
        const innerSuite = createSuite('inner', [createTest('other', 'fail', [new Error('foo')])], 'fail');
        const outerSuite = createSuite('outer', [innerSuite, createTest('passed', 'pass')], 'fail');
        const testFile = createFile([outerSuite], 'fail');

        vitestResultsProcessor([testFile]);

        [innerSuite, outerSuite, testFile].forEach((suite) => expect(suite.result?.state).toBe('pass'));
    });

    it('should keep suites failing due to a11y errors or their own errors as failed', () => {
        const a11ySuite = createSuite('a11y', [createTest('a11y', 'fail', [a11yError])], 'fail');
        const a11yFile = createFile([a11ySuite], 'fail');
        // Suite failing due to its own error e.g. in a hook
        const hookSuite = createSuite('hook', [createTest('passed', 'pass')], 'fail', [new Error('foo')]);
        const hookFile = createFile([hookSuite], 'fail');

        vitestResultsProcessor([a11yFile, hookFile]);

        [a11ySuite, a11yFile, hookSuite, hookFile].forEach((suite) => expect(suite.result?.state).toBe('fail'));
    });

    it('should not modify tests that have not failed', () => {
        const testFile = createFile([createTest('passed', 'pass'), createTest('skipped', 'skip'), createTest('new')]);
        const expected = JSON.parse(JSON.stringify(testFile)) as RunnerTestFile;

        vitestResultsProcessor([testFile]);

        expect(testFile).toEqual(expected);
    });
});
