/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/* This is the pattern from semantic-release */
const automaticCommitPattern = /^chore\(release\):.*\[skip ci\]/;

/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
    extends: ['@commitlint/config-conventional'],
    ignores: [(commitMsg) => automaticCommitPattern.test(commitMsg)],
};
