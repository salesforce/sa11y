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
        preferConst: true,
    },
    plugins: [
        progress({ clearLine: false }),
        resolve(),
        commonjs(),
        typescript({ tsconfigOverride: { compilerOptions: { module: 'es2015' } } }),
        // TODO (debug): Get version injection to work https://github.com/djhouseknecht/rollup-plugin-version-injector/issues/4
        // versionInjector({ logLevel: 'debug' }),
        terser(), // Note: Comment to get un-minified file for debugging etc
        sizes({ details: true }),
    ],
};
