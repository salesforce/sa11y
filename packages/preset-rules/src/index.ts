/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

export { defaultPriority, priorities, wcagLevels, getA11yConfig, RuleInfo } from './rules';
export { defaultRuleset, getDefaultRuleset } from './config';
export { extended } from './extended';
export { base } from './base';
export { full, excludedRules } from './full';
export { WcagMetadata } from './wcag';
import changesData from './custom-rules/changes';
import rulesData from './custom-rules/rules';
import checkData from './custom-rules/checks';
export { changesData, rulesData, checkData };
