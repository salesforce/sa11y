/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import progress from 'rollup-plugin-progress';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import sizes from 'rollup-plugin-sizes';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

export default {
    input: 'src/index.ts',
    output: {
        // TODO (refactor): add "pkg.module" https://github.com/rollup/rollup/wiki/pkg.module ?
        file: pkg.browser,
        format: 'iife',
        name: 'sa11y',
    },
    plugins: [
        progress({ clearLine: false }),
        resolve(),
        commonjs(), // TODO (debug): Why do we need commonjs transformation even when tsconfig has "module": "es2015" ?
        typescript(), // TODO (refactor): Re-eval all compiler options for this project https://www.typescriptlang.org/docs/handbook/compiler-options.html
        sizes({ details: true }),
        terser(), // Note: Comment to get un-minified file for debugging etc
    ],
};
