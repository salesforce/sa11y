/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { AxeResults } from './axe';

export const errMsgHeader = 'Accessibility issues found';

/**
 * Filter to post-process a11y results from axe
 */
export interface Filter {
    (violations: AxeResults, ...args: never[]): AxeResults;
}

// TODO (refactor): constrain rule id to known rule ids e.g using string literal, keyof, in etc
//  e.g. https://stackoverflow.com/a/54061487
// const ruleIDs = getRules().map((ruleObj) => ruleObj.ruleId);
// type RuleID = keyof ruleIDs;
// type RuleID = typeof ruleIDs[number];
// Array of length 2 or greater
type MultiArray<T> = [T, T, ...T[]];

// Selectors within a frame
type BaseSelector = string;

type ShadowDomSelector = MultiArray<BaseSelector>;
type CrossTreeSelector = BaseSelector | ShadowDomSelector;
type RuleID = string;
type CssSelectors = CrossTreeSelector[];
/**
 * Exception list of map of rule to corresponding css targets that needs to be filtered from a11y results.
 */
export type ExceptionList = Record<RuleID, CssSelectors>;
