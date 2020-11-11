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
import { namespace } from './src/index.ts';

const globalName = '__SA11Y__';

/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access */
function getConfig(minified = false) {
    const debug = !!process.env.DEBUG;

    return {
        input: 'src/index.ts',
        output: {
            file: minified ? `dist/${namespace}.min.js` : `dist/${namespace}.js`,
            format: 'iife',
            name: globalName,
            preferConst: true,
            // Note: Following is required for the object to get declared in browser using webdriver
            banner: `typeof ${namespace} === "undefined" && (${namespace} = {});`,
            footer: `Object.assign(${namespace}, ${globalName}); ${namespace}.version = '${pkg.version}';`,
        },
        plugins: [
            debug ? progress({ clearLine: false }) : {},
            resolve(),
            commonjs(),
            typescript({
                tsconfigOverride: { compilerOptions: { module: 'es2015' } },
                verbosity: debug ? 3 : 1,
            }),
            minified ? terser() : {},
            sizes({ details: debug }),
        ],
    };
}
/* eslint-enable @typescript-eslint/no-unsafe-call, @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access */

export default [
    // Produce both minified and un-minified files
    getConfig(false),
    getConfig(true),
];
