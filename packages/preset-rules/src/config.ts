/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { A11yConfig } from '@sa11y/common';
import { base } from './base';
import { extended } from './extended';
import { full } from './full';

export const ruleSets = new Map(Object.entries({ base: base, extended: extended, full: full }));

/**
 * Get ruleset from environment variable `SA11Y_RULESET` if defined.
 * Defaults to `base` ruleset.
 */
export function getDefaultRuleset(): A11yConfig {
    const envRuleset = process.env.SA11Y_RULESET;
    return envRuleset ? ruleSets.get(envRuleset) || base : base;
}

export const defaultRuleset = getDefaultRuleset();
