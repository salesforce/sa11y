/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import type { RunnerTask, RunnerTestFile } from 'vitest/node';
import { A11yError } from '@sa11y/format';
import { processA11yDetailsAndMessages } from '@sa11y/matcher';

/**
 * Keep only the a11y errors of a failed test, suite or file, with their violations grouped by rule.
 * It is marked as passed when no a11y failures remain in it or its tasks, so that only a11y failures are reported.
 */
function processTask(task: RunnerTask): void {
    if (task.type === 'suite') task.tasks.forEach(processTask);
    const result = task.result;
    if (result?.state !== 'fail') return;

    // Errors are serialized when sent from the test worker to the reporter, losing their prototype.
    // Hence match a11y errors by name instead of using instanceof.
    result.errors = (result.errors ?? []).filter((error) => error.name === A11yError.name);
    result.errors.forEach((error) => {
        const a11yFailureMessages: string[] = [];
        processA11yDetailsAndMessages(error as unknown as A11yError, a11yFailureMessages);
        // Replace both as reporters prefer the stack over the message when present,
        // and clear the parsed stack frames which reporters print otherwise
        error.message = a11yFailureMessages[0];
        error.stack = a11yFailureMessages[0];
        error.stacks = [];
    });

    const hasFailedTasks = task.type === 'suite' && task.tasks.some((child) => child.result?.state === 'fail');
    if (result.errors.length === 0 && !hasFailedTasks) result.state = 'pass';
}

/**
 * Custom results processor for a11y results grouping the violations, mirroring the Jest
 * `groupViolationResultsProcessor`. To be called by a Vitest reporter before it writes the results.
 * Results of tests, suites (describe blocks) and test files are modified in place.
 */
export function vitestResultsProcessor(testFiles: RunnerTestFile[]): RunnerTestFile[] {
    testFiles.forEach(processTask);
    return testFiles;
}
