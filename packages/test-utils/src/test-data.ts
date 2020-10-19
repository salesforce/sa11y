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
const fileWithA11yIssues = path.resolve(__dirname, '../__data__/a11yIssues.html');
export const htmlFileWithA11yIssues = 'file:///' + fileWithA11yIssues;
export const domWithA11yIssues = fs.readFileSync(fileWithA11yIssues).toString();
export const a11yIssuesCount = 6;

// DOM containing no a11y issues
export const shadowDomID = 'upside-down';
const fileWithNoA11yIssues = path.resolve(__dirname, '../__data__/noA11yIssues.html');
export const htmlFileWithNoA11yIssues = 'file:///' + fileWithNoA11yIssues;
export const domWithNoA11yIssues = fs.readFileSync(fileWithNoA11yIssues).toString();

// Sample media files
// TODO (refactor): Is there a way to reuse these values inside the noA11yIssues.html
export const audioURL = 'https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_700KB.mp3';
export const videoURL = 'https://file-examples-com.github.io/uploads/2020/03/file_example_WEBM_480_900KB.webm';
