/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import axe from 'axe-core';
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

/**
 * Run the label-in-name check the way axe does: build the virtual tree for the current DOM and pass
 * the element's virtualNode (the check uses `axe.commons.text.*`, which operate on virtual nodes).
 */
function labelInName(el: Element): boolean {
    axe.teardown();
    axe.setup(document.documentElement);
    const vNode = (axe as unknown as { utils: { getNodeFromTree(n: Element): unknown } }).utils.getNodeFromTree(
        el
    );
    return sa11yLabelInNameCheck(el, {}, vNode);
}

afterEach(() => {
    axe.teardown();
    while (document.body.firstChild) {
        document.body.removeChild(document.body.firstChild);
    }
});

describe('custom check assembler (checks/index.ts)', () => {
    it('emits one entry per active check function with the expected ids', () => {
        // Existing shipped checks are kept for backward compatibility; the new W-22990841
        // checks are added alongside them.
        expect(checkData.map((c) => c.id)).toEqual([
            'sa11y-Keyboard-check',
            'Resize-reflow-textoverflow-check',
            'sa11y-Keyboard-button-check',
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
        expect(labelInName(control('Save Changes'))).toBe(true);
    });

    it('passes when the accessible name contains the visible text', () => {
        expect(labelInName(control('Save Changes', { 'aria-label': 'Save Changes now' }))).toBe(true);
    });

    it('passes on an exact match', () => {
        expect(labelInName(control('Save Changes', { 'aria-label': 'Save Changes' }))).toBe(true);
    });

    it('fails when the accessible name does not contain the visible text', () => {
        expect(labelInName(control('Save Changes', { 'aria-label': 'Submit' }))).toBe(false);
    });

    it('ignores punctuation and smart quotes when comparing', () => {
        expect(labelInName(control('Save Changes!', { 'aria-label': 'save changes' }))).toBe(true);
        expect(labelInName(control('Can’t do', { 'aria-label': 'cant do' }))).toBe(true);
    });

    it('passes an icon-only control with no visible text', () => {
        expect(labelInName(control('', { 'aria-label': 'Close' }))).toBe(true);
    });

    it('resolves aria-labelledby and fails on mismatch', () => {
        control('Submit', { id: 'lbl-1' }, 'span');
        const btn = control('Save Changes', { 'aria-labelledby': 'lbl-1' });
        expect(labelInName(btn)).toBe(false);
    });

    it('resolves aria-labelledby and passes when it contains the visible text', () => {
        control('Save Changes now', { id: 'lbl-2' }, 'span');
        const btn = control('Save Changes', { 'aria-labelledby': 'lbl-2' });
        expect(labelInName(btn)).toBe(true);
    });

    it('does not flag a parent treeitem whose hidden subtree text is excluded (Setup-nav FP)', () => {
        // Regression for the 30-instance false positive: the previous `textContent` implementation
        // pulled in the hidden disclosure control's text, so the long visible string was no longer a
        // substring of the short aria-label. visibleVirtual excludes the hidden subtree, so it passes.
        const li = control('Slack', { role: 'treeitem', 'aria-label': 'Slack' }, 'li');
        const hidden = document.createElement('span');
        hidden.textContent = 'Collapse Slack sub menu';
        hidden.setAttribute('style', 'display:none');
        li.appendChild(hidden);
        expect(labelInName(li)).toBe(true);
    });

    it('skips aria-hidden and disabled controls', () => {
        expect(labelInName(control('Save Changes', { 'aria-label': 'Submit', 'aria-hidden': 'true' }))).toBe(true);
        expect(labelInName(control('Save Changes', { 'aria-label': 'Submit', disabled: '' }))).toBe(true);
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
