/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import axe from 'axe-core';
import { sa11yTextTruncationCheck } from './sa11y-text-truncation-check';
import { sa11yTextSpacingOverflowCheck } from './sa11y-text-spacing-overflow-check';
import { sa11yLabelInNameCheck } from './sa11y-label-in-name-check';

/*
 * axe serializes each check's `evaluate` and re-creates it at test time (including inside child
 * iframes via postMessage), so `evaluate` must be a *string* that starts with `function`. We keep
 * the actual logic in the sibling `*-check.ts` files — real, type-checked, lint-checked, unit-
 * testable functions — and serialize them here with `.toString()`. This is the single place that
 * couples the functions to axe's string contract; the functions themselves stay ordinary code.
 *
 * The metadata (id, options, impact, messages) is preserved verbatim from the previous inline
 * definitions so the emitted rule catalog is unchanged.
 */
const checkData = [
    /*
     * DISABLED for the W-22990841 spike — the keyboard checks below are not part of the rules we are
     * validating, so their source files were deleted. The check definitions are preserved here (with
     * their evaluate as a plain string) in case someone wants to re-enable them later; to do so,
     * uncomment the entry AND the matching rule in `rules.ts` (`sa11y-Keyboard` / `sa11y-Keyboard-button`),
     * or restore the standalone `*-check.ts` file and use `<fn>.toString()` like the active checks.
     *
     * {
     *     id: 'sa11y-Keyboard-check',
     *     options: ['sa11y-Keyboard-check'],
     *     evaluate: "function (node) { return !!node.hasAttribute('tabindex'); }",
     *     metadata: {
     *         impact: 'critical',
     *         messages: {
     *             pass: 'Button elements are Keyboard operable',
     *             fail: "Button elements are not Keyboard operable,To fix add tabindex='0' attribute and  appropriate keyboard event handler.",
     *         },
     *     },
     * },
     */
    {
        id: 'sa11y-text-truncation-check',
        evaluate: sa11yTextTruncationCheck.toString(),
        metadata: {
            impact: 'moderate',
            messages: {
                pass: 'Text element does not have ellipses ',
                fail: 'Text element have ellipses which make difficulty to read',
            },
        },
    },
    /*
     * DISABLED for the W-22990841 spike (see note above). Reference definition:
     * {
     *     id: 'sa11y-Keyboard-button-check',
     *     evaluate: "function (node) { return node.hasAttribute('tabindex'); }",
     *     messages: {
     *         pass: 'Button element are keyboard operable',
     *         fail: "Button element are not keyboard operable, To fix add tabindex='0' attribute and appropriate keyboard event handler.",
     *     },
     * },
     */
    {
        id: 'sa11y-text-spacing-overflow-check',
        evaluate: sa11yTextSpacingOverflowCheck.toString(),
        metadata: {
            impact: 'serious',
            messages: {
                pass: 'Content is not clipped when WCAG text spacing is applied',
                fail: 'Content is clipped or overflows when WCAG 1.4.12 text spacing is applied. Ensure no loss of content when word-spacing 0.16em, letter-spacing 0.12em and line-height 1.5 are set.',
            },
        },
    },
    {
        id: 'sa11y-label-in-name-check',
        evaluate: sa11yLabelInNameCheck.toString(),
        metadata: {
            impact: 'serious',
            messages: {
                pass: 'The accessible name contains the visible label text',
                fail: 'The accessible name does not contain the visible label text (WCAG 2.5.3). Speech-input users cannot activate this control by its visible name.',
            },
        },
    },
];

export default checkData as axe.Check[];
