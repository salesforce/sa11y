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
import { nameSpace } from './src/index.ts';

const globalName = '__SA11Y__';

export default {
    input: 'src/index.ts',
    output: {
        file: pkg.browser,
        format: 'iife',
        name: globalName,
        preferConst: true,
        // Note: Following is required for the object to get declared in browser using webdriver
        banner: `typeof ${nameSpace} === "undefined" && (${nameSpace} = {});`,
        footer: `Object.assign(${nameSpace}, ${globalName}); ${nameSpace}.version = '${pkg.version}';`,
    },
    plugins: [
        progress({ clearLine: false }),
        resolve(),
        commonjs(),
        typescript({ tsconfigOverride: { compilerOptions: { module: 'es2015' } } }),
        terser(), // Note: Comment to get un-minified file for debugging etc
        sizes({ details: true }),
    ],
};
