/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
// vitestResultsProcessor.ts

import type { RunnerTestFile } from 'vitest/node';
import type { Test } from '@vitest/runner';
import { A11yError } from '@sa11y/format';
import { processA11yDetailsAndMessages } from '@sa11y/matcher';

export function vitestResultsProcessor(testFiles: RunnerTestFile[]): RunnerTestFile[] {
    for (const file of testFiles) {
        for (const task of file.tasks) {
            const test = task as Test;

            if (test.result?.state !== 'fail') {
                continue;
            }

            const messages: string[] = [];
            const details = test.result.errors ?? [];

            const updatedDetails = details.filter((failure) => {
                const error = failure as A11yError;
                if (error?.name === A11yError.name) {
                    processA11yDetailsAndMessages(error, messages);
                    return true;
                }
                return false;
            });

            if (updatedDetails.length === 0) {
                test.result.state = 'pass';
                test.result.errors = [];
            } else {
                test.result.errors = updatedDetails.map((err, index) => {
                    const error = err as A11yError;
                    if (messages[index]) {
                        error.message += `\n${messages[index]}`;
                    }
                    return error;
                });
            }
        }
    }

    return testFiles;
}
