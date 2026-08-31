/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import checkData from '../src/custom-rules/checks';
import { sa11yLabelInNameCheck } from '../src/custom-rules/checks/sa11y-label-in-name-check';
import { sa11yTextSpacingOverflowCheck } from '../src/custom-rules/checks/sa11y-text-spacing-overflow-check';
import { sa11yTextTruncationCheck } from '../src/custom-rules/checks/sa11y-text-truncation-check';
import { expect } from '@jest/globals';

// axe reconstructs each check's `evaluate` from its string form at test time (createExecutionContext),
// accepting it only when it matches this regex. If a transpile/minify step ever emits an arrow
// function or a class method shorthand, this contract breaks silently at runtime — assert it here.
const axeFnString = /^\s*function[\s\w]*\(/;

/** Build a control element with an optional visible label and aria attributes, no innerHTML. */
function control(visibleText: string, attrs: Record<string, string> = {}, tag = 'button'): Element {
    const el = document.createElement(tag);
    if (visibleText) {
        el.textContent = visibleText;
    }
    Object.keys(attrs).forEach((k) => el.setAttribute(k, attrs[k]));
    document.body.appendChild(el);
    return el;
}

afterEach(() => {
    while (document.body.firstChild) {
        document.body.removeChild(document.body.firstChild);
    }
});

describe('custom check assembler (checks/index.ts)', () => {
    it('emits one entry per active check function with the expected ids', () => {
        // The keyboard checks are intentionally disabled for the spike (commented out in
        // checks/index.ts and rules.ts), so they are absent here.
        expect(checkData.map((c) => c.id)).toEqual([
            'sa11y-text-truncation-check',
            'sa11y-text-spacing-overflow-check',
            'sa11y-label-in-name-check',
        ]);
    });

    it.each(checkData.map((c) => [c.id, c.evaluate]))(
        'serializes %s.evaluate as an axe-compatible function string',
        (_id, evaluate) => {
            expect(typeof evaluate).toBe('string');
            expect(evaluate as string).toMatch(axeFnString);
        }
    );
});

describe('sa11yLabelInNameCheck (SC 2.5.3)', () => {
    it('passes when there is no aria-label(ledby) — accessible name is the content', () => {
        expect(sa11yLabelInNameCheck(control('Save Changes'))).toBe(true);
    });

    it('passes when the accessible name contains the visible text', () => {
        expect(sa11yLabelInNameCheck(control('Save Changes', { 'aria-label': 'Save Changes now' }))).toBe(true);
    });

    it('passes on an exact match', () => {
        expect(sa11yLabelInNameCheck(control('Save Changes', { 'aria-label': 'Save Changes' }))).toBe(true);
    });

    it('fails when the accessible name does not contain the visible text', () => {
        expect(sa11yLabelInNameCheck(control('Save Changes', { 'aria-label': 'Submit' }))).toBe(false);
    });

    it('ignores punctuation and smart quotes when comparing', () => {
        expect(sa11yLabelInNameCheck(control('Save Changes!', { 'aria-label': 'save changes' }))).toBe(true);
        expect(sa11yLabelInNameCheck(control('Can’t do', { 'aria-label': 'cant do' }))).toBe(true);
    });

    it('passes an icon-only control with no visible text', () => {
        expect(sa11yLabelInNameCheck(control('', { 'aria-label': 'Close' }))).toBe(true);
    });

    it('resolves aria-labelledby and fails on mismatch', () => {
        control('Submit', { id: 'lbl-1' }, 'span');
        const btn = control('Save Changes', { 'aria-labelledby': 'lbl-1' });
        expect(sa11yLabelInNameCheck(btn)).toBe(false);
    });

    it('resolves aria-labelledby and passes when it contains the visible text', () => {
        control('Save Changes now', { id: 'lbl-2' }, 'span');
        const btn = control('Save Changes', { 'aria-labelledby': 'lbl-2' });
        expect(sa11yLabelInNameCheck(btn)).toBe(true);
    });
});

describe('layout-dependent checks (smoke — jsdom has no layout)', () => {
    // jsdom returns 0 for all scroll/client dimensions and never reports text-overflow/line-clamp,
    // so these exercise the guard/early-return paths only. The clip-detection branches are covered
    // by the browser FTest run (see the /* istanbul ignore next */ markers in the check files).
    it('sa11yTextSpacingOverflowCheck passes empty / hidden elements and restores inline styles', () => {
        expect(sa11yTextSpacingOverflowCheck(document.createElement('div'))).toBe(true);

        const el = control('hello world', {}, 'p') as HTMLElement;
        el.style.setProperty('word-spacing', '2px');
        expect(sa11yTextSpacingOverflowCheck(el)).toBe(true);
        // inline styles are saved and restored — the check must not mutate the DOM
        expect(el.style.getPropertyValue('word-spacing')).toBe('2px');
        expect(el.style.getPropertyValue('letter-spacing')).toBe('');
    });

    it('sa11yTextTruncationCheck passes elements without ellipsis / clamp', () => {
        expect(sa11yTextTruncationCheck(document.createElement('div'))).toBe(true);
        expect(sa11yTextTruncationCheck(control('not truncated', {}, 'p') as HTMLElement)).toBe(true);
    });
});
