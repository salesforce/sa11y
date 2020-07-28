/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { getA11yConfig } from './a11yConfig';
import * as axe from 'axe-core';

export const full = getA11yConfig(axe.getRules().map((ruleObj) => ruleObj.ruleId));
