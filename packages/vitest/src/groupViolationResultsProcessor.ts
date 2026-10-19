/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import type { RunnerTask, RunnerTestCase, RunnerTestFile, RunnerTestSuite } from 'vitest/node';
import { A11yError } from '@sa11y/format';
import { processA11yDetailsAndMessages } from '@sa11y/matcher';

/**
 * Keep only the a11y errors of a failed test, with their violations grouped by rule.
 * A failed test without a11y errors is marked as passed so that only a11y failures are reported.
 */
function processA11yErrors(test: RunnerTestCase): void {
    const result = test.result;
    if (result?.state !== 'fail') return;

    // Errors are serialized when sent from the test worker to the reporter, losing their prototype.
    // Hence match a11y errors by name instead of using instanceof.
    const a11yErrors = (result.errors ?? []).filter((error) => error.name === A11yError.name);
    if (a11yErrors.length === 0) {
        result.state = 'pass';
        result.errors = [];
        return;
    }

    a11yErrors.forEach((error) => {
        const a11yFailureMessages: string[] = [];
        processA11yDetailsAndMessages(error as unknown as A11yError, a11yFailureMessages);
        // Replace both as reporters prefer the stack over the message when present,
        // and clear the parsed stack frames which reporters print otherwise
        error.message = a11yFailureMessages[0];
        error.stack = a11yFailureMessages[0];
        error.stacks = [];
    });
    result.errors = a11yErrors;
}

/**
 * Process the tasks of a suite (or file), marking it as passed if it failed only due to tests now marked as passed
 */
function processSuite(suite: RunnerTestSuite): void {
    processTasks(suite.tasks);
    const result = suite.result;
    if (
        result?.state === 'fail' &&
        !result.errors?.length &&
        suite.tasks.every((task) => task.result?.state !== 'fail')
    ) {
        result.state = 'pass';
    }
}

function processTasks(tasks: RunnerTask[]): void {
    tasks.forEach((task) => {
        if (task.type === 'suite') processSuite(task);
        else processA11yErrors(task);
    });
}

/**
 * Custom results processor for a11y results grouping the violations, mirroring the Jest
 * `groupViolationResultsProcessor`. To be called by a Vitest reporter before it writes the results.
 * Test results, including those nested in suites (describe blocks), are modified in place.
 */
export function vitestResultsProcessor(testFiles: RunnerTestFile[]): RunnerTestFile[] {
    processTasks(testFiles);
    return testFiles;
}
