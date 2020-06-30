/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import fs from 'fs';
import path from 'path';

// DOM with a11y issues
export const domWithA11yIssuesBodyID = 'dom-with-issues';
export const htmlFileWithA11yIssues = path.resolve(__dirname, '../__data__/a11yIssues.html');
export const domWithA11yIssues = fs.readFileSync(htmlFileWithA11yIssues).toString();

// DOM containing no a11y issues
export const shadowDomID = 'upside-down';
export const htmlFileWithNoA11yIssues = path.resolve(__dirname, '../__data__/noA11yIssues.html');
export const domWithNoA11yIssues = fs.readFileSync(htmlFileWithNoA11yIssues).toString();
