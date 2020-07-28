/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

module.exports = {
    '**/*.{js,ts,json,yaml,yml,md}': 'prettier --write',
    '**/*.{js,ts,md}': ['eslint --fix', 'cspell -- --no-summary'],
    '**/*.md': ['markdown-link-check --quiet --config mdLinkChecker.json', 'doctoc --github'],
    'yarn.lock': 'yarn lint:lockfile',
    'package.json': () => 'yarn install',
};
