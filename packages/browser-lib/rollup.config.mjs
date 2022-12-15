/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import progress from 'rollup-plugin-progress';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import sizes from 'rollup-plugin-sizes';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json' assert { type: 'json' };
export const namespace = 'sa11y';

const globalName = '__SA11Y__';

/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access */
function getConfig(minified = false) {
    const debug = !!process.env.DEBUG;

    return {
        input: 'src/index.ts',
        output: {
            file: minified ? `dist/${namespace}.min.js` : `dist/${namespace}.js`,
            format: 'iife',
            generatedCode: {
                constBindings: true,
            },
            name: globalName,
            // Note: Following is required for the object to get declared in browser using webdriver
            banner: `typeof ${namespace} === "undefined" && (${namespace} = {});`,
            footer: `Object.assign(${namespace}, ${globalName}); ${namespace}.version = '${pkg.version}';`,
        },
        plugins: [
            debug ? progress({ clearLine: false }) : {},
            nodePolyfills(), // axe-core uses node's "crypto" module
            resolve(),
            commonjs(),
            typescript({
                tsconfigOverride: { compilerOptions: { module: 'es2015' } },
                verbosity: debug ? 3 : 1,
            }),
            minified ? terser() : {},
            sizes({ details: debug }),
            replace({
                // 'process' is not defined in browser
                /* eslint-disable @typescript-eslint/naming-convention */
                'process.env.SA11Y_AUTO': JSON.stringify(''),
                'process.env.SA11Y_AUTO_FILTER': JSON.stringify(''),
                'process.env.SA11Y_CLEANUP': JSON.stringify(''),
                'process.env.SA11Y_DEBUG': JSON.stringify(''),
                'process.env.SA11Y_RULESET': JSON.stringify('base'),
                'process.env.SA11Y_RULESET_PRIORITY': JSON.stringify(''),
                /* eslint-enable @typescript-eslint/naming-convention */
                'preventAssignment': true,
            }),
        ],
    };
}
/* eslint-enable @typescript-eslint/no-unsafe-call, @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access */

export default [
    // Produce both minified and un-minified files
    getConfig(false),
    getConfig(true),
];
