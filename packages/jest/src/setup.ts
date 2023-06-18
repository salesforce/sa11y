/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { toBeAccessible } from './matcher';
import { A11yConfig } from '@sa11y/common';
import { AutoCheckOpts, registerSa11yAutomaticChecks, setOriginalDocumentBodyHtml } from './automatic';
import { expect } from '@jest/globals';
import { toMatchSnapshot, SnapshotState } from 'jest-snapshot';
import type { MatcherFunctionWithState, MatcherState } from 'expect';

interface Context extends MatcherState {
    snapshotState: SnapshotState;
}

export const disabledRules = [
    // Descendancy checks that would fail at unit/component level, but pass at page level
    'aria-required-children',
    'aria-required-parent',
    'dlitem',
    'definition-list',
    'list',
    'listitem',
    'landmark-one-main',
    // color-contrast doesn't work for JSDOM and might affect performance
    //  https://github.com/dequelabs/axe-core/issues/595
    //  https://github.com/dequelabs/axe-core/blob/develop/doc/examples/jsdom/test/a11y.js
    'color-contrast',
    // audio, video elements are stubbed out in JSDOM
    //  https://github.com/jsdom/jsdom/issues/2155
    'audio-caption',
    'video-caption',
];

function wrapperSnapshotMatcher(originalMatcher: MatcherFunctionWithState<Context>) {
    return function (...args: Context[]) {
        setOriginalDocumentBodyHtml(document?.body?.innerHTML ?? '');
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return originalMatcher.call(expect.getState(), ...args);
    };
}

/**
 * Options to be passed on to {@link setup}
 */
export type Sa11yOpts = {
    autoCheckOpts: AutoCheckOpts;
    // TODO (feat): add support for global opts to control formatting, filtering etc
    // runOpts: RunOpts; // including ruleset, include/exclude selectors etc
    // formatOpts: FormatOpts; // including format.Options etc
    // filterOpts: FilterOpts; // including exception list filtering etc
};

/**
 * Default options for sa11y jest matcher
 */
const defaultSa11yOpts: Sa11yOpts = {
    autoCheckOpts: {
        runAfterEach: false,
        cleanupAfterEach: false,
        consolidateResults: false,
    },
};

/**
 * Register Sa11y Jest API and automatic checks depending on {@link Sa11yOpts}
 * @param opts - {@link Sa11yOpts} to opt-in to automatic checks
 */
export function setup(opts: Sa11yOpts = defaultSa11yOpts): void {
    registerSa11yMatcher();
    // Set defaults from env vars
    const autoCheckOpts = opts.autoCheckOpts;
    autoCheckOpts.runAfterEach ||= !!process.env.SA11Y_AUTO;
    // Consolidate results if automatic checks is enabled
    autoCheckOpts.consolidateResults ||= autoCheckOpts.runAfterEach;
    autoCheckOpts.cleanupAfterEach ||= !!process.env.SA11Y_CLEANUP;
    if (process.env.SA11Y_AUTO_FILTER?.trim().length)
        autoCheckOpts.filesFilter ||= process.env.SA11Y_AUTO_FILTER.split(',');
    registerSa11yAutomaticChecks(autoCheckOpts);
}

/**
 * Register accessibility helpers toBeAccessible as jest matchers
 */
export function registerSa11yMatcher(): void {
    const wrapper = wrapperSnapshotMatcher(toMatchSnapshot);
    if (expect !== undefined) {
        expect.extend({ toBeAccessible, toMatchSnapshot: wrapper });
    } else {
        throw new Error(
            "Unable to find Jest's expect function." +
                '\nPlease check your Jest installation and that you have added @sa11y/jest correctly to your jest configuration.' +
                '\nSee https://github.com/salesforce/sa11y/tree/master/packages/jest#readme for help.'
        );
    }
}

/**
 * Customize sa11y preset rules specific to JSDOM
 */
export function adaptA11yConfig(config: A11yConfig, filterRules = disabledRules): A11yConfig {
    // TODO (refactor): Move into preset-rules pkg as a generic rules filter util
    const adaptedConfig = JSON.parse(JSON.stringify(config)) as A11yConfig;
    adaptedConfig.runOnly.values = config.runOnly.values.filter((rule) => !filterRules.includes(rule));
    return adaptedConfig;
}
