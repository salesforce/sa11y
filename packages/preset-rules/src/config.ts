/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { A11yConfig } from '@sa11y/common';
import { base } from './base';
import { recommended } from './recommended';
import { full } from './full';

/**
 * Get ruleset from environment variable `SA11Y_RULESET` if defined.
 * Defaults to `recommended` ruleset.
 */
export function getDefaultRuleset(): A11yConfig {
    const ruleSets = new Map(Object.entries({ base: base, recommended: recommended, full: full }));
    const envRuleset = process.env.SA11Y_RULESET;
    return envRuleset ? ruleSets.get(envRuleset) || recommended : recommended;
}

export const defaultRuleset = getDefaultRuleset();
