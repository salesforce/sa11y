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
 * jsdom has no layout engine: getBoundingClientRect() always returns a 0x0 box, so every element
 * trips the sr-only / zero-size guard before reaching the real logic. Stub a non-zero box so the
 * element is treated as visible and the decision branches below become reachable.
 */
function visible(el: HTMLElement, width = 100, height = 20): HTMLElement {
    el.getBoundingClientRect = () =>
        ({ width, height, top: 0, left: 0, right: width, bottom: height, x: 0, y: 0, toJSON: () => ({}) } as DOMRect);
    return el;
}

/** Script the scroll/client metrics jsdom cannot compute. Accepts fixed values or getter functions. */
function setMetrics(el: HTMLElement, m: Record<string, number | (() => number)>): void {
    Object.keys(m).forEach((k) => {
        const v = m[k];
        Object.defineProperty(el, k, { configurable: true, get: () => (typeof v === 'function' ? v() : v) });
    });
}

/**
 * Run the label-in-name check the way axe does: build the virtual tree for the current DOM and pass
 * the element's virtualNode (the check uses `axe.commons.text.*`, which operate on virtual nodes).
 */
function labelInName(el: Element): boolean {
    axe.teardown();
    axe.setup(document.documentElement);
    const vNode = (axe as unknown as { utils: { getNodeFromTree(n: Element): unknown } }).utils.getNodeFromTree(el);
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
        const li = control('Slack', { 'role': 'treeitem', 'aria-label': 'Slack' }, 'li');
        const hidden = document.createElement('span');
        hidden.textContent = 'Collapse Slack sub menu';
        hidden.setAttribute('style', 'display:none');
        li.appendChild(hidden);
        expect(labelInName(li)).toBe(true);
    });

    it('skips aria-hidden and disabled controls', () => {
        expect(labelInName(control('Save Changes', { 'aria-label': 'Submit', 'aria-hidden': 'true' }))).toBe(true);
        expect(labelInName(control('Save Changes', { 'aria-label': 'Submit', 'disabled': '' }))).toBe(true);
    });
});

describe('sa11yTextSpacingOverflowCheck (SC 1.4.12)', () => {
    it('passes null / style-less nodes and zero-size (sr-only) boxes', () => {
        expect(sa11yTextSpacingOverflowCheck(null as unknown as HTMLElement)).toBe(true);
        // jsdom reports a 0x0 box for every element, so an un-stubbed node is treated as sr-only.
        expect(sa11yTextSpacingOverflowCheck(document.createElement('div'))).toBe(true);
    });

    it('passes hidden elements (display:none / visibility:hidden)', () => {
        const none = visible(control('hi', {}, 'p') as HTMLElement);
        none.style.display = 'none';
        expect(sa11yTextSpacingOverflowCheck(none)).toBe(true);

        const hidden = visible(control('hi', {}, 'p') as HTMLElement);
        hidden.style.visibility = 'hidden';
        expect(sa11yTextSpacingOverflowCheck(hidden)).toBe(true);
    });

    it('passes layout containers with no own (direct-child) text node', () => {
        const wrapper = visible(control('', {}, 'div') as HTMLElement);
        wrapper.appendChild(document.createElement('span')); // text lives in a descendant, not here
        expect(sa11yTextSpacingOverflowCheck(wrapper)).toBe(true);
    });

    it('passes visible text that does not newly clip when spacing is applied, restoring inline styles', () => {
        const el = visible(control('hello world', {}, 'p') as HTMLElement);
        el.style.setProperty('word-spacing', '2px');
        setMetrics(el, { scrollWidth: 100, clientWidth: 100, scrollHeight: 20, clientHeight: 20 });
        expect(sa11yTextSpacingOverflowCheck(el)).toBe(true);
        // inline styles are saved and restored — the check must not mutate the DOM
        expect(el.style.getPropertyValue('word-spacing')).toBe('2px');
        expect(el.style.getPropertyValue('letter-spacing')).toBe('');
    });

    it('fails when applying WCAG text spacing newly clips the content, and restores saved styles', () => {
        const el = visible(control('hello world', {}, 'p') as HTMLElement);
        // Pre-existing author styles must survive: they are the saved/restore path.
        el.style.setProperty('word-spacing', '1px');
        el.style.setProperty('letter-spacing', '1px');
        el.style.setProperty('line-height', '1.2');
        // Not overflowing until the override widens the content past the clientWidth.
        setMetrics(el, {
            scrollWidth: () => (el.style.getPropertyValue('word-spacing') === '0.16em' ? 200 : 50),
            clientWidth: 100,
            scrollHeight: 20,
            clientHeight: 20,
        });
        expect(sa11yTextSpacingOverflowCheck(el)).toBe(false);
        expect(el.style.getPropertyValue('word-spacing')).toBe('1px');
        expect(el.style.getPropertyValue('letter-spacing')).toBe('1px');
        expect(el.style.getPropertyValue('line-height')).toBe('1.2');
    });
});

describe('sa11yTextTruncationCheck (SC 1.4.10 truncation)', () => {
    it('passes null nodes and zero-size / sr-only boxes', () => {
        expect(sa11yTextTruncationCheck(null as unknown as HTMLElement)).toBe(true);
        expect(sa11yTextTruncationCheck(document.createElement('div'))).toBe(true);
    });

    it('passes hidden elements (display:none / visibility:hidden)', () => {
        const none = visible(control('hi', {}, 'p') as HTMLElement);
        none.style.display = 'none';
        expect(sa11yTextTruncationCheck(none)).toBe(true);

        const hidden = visible(control('hi', {}, 'p') as HTMLElement);
        hidden.style.visibility = 'hidden';
        expect(sa11yTextTruncationCheck(hidden)).toBe(true);
    });

    it('passes an absolutely-positioned clip-rect(0 0 0 0) sr-only node', () => {
        const el = visible(control('assistive text', {}, 'span') as HTMLElement);
        el.style.position = 'absolute';
        el.style.clip = 'rect(0 0 0 0)';
        expect(sa11yTextTruncationCheck(el)).toBe(true);
    });

    it('passes when the visible subtree has no rendered text (icon + sr-only child)', () => {
        const el = visible(control('', {}, 'button') as HTMLElement);
        const srOnly = document.createElement('span');
        srOnly.textContent = 'Close';
        srOnly.style.display = 'none';
        el.appendChild(srOnly);
        expect(sa11yTextTruncationCheck(el)).toBe(true);
    });

    it('passes visible text with no ellipsis / clamp styling', () => {
        expect(sa11yTextTruncationCheck(visible(control('not truncated', {}, 'p') as HTMLElement))).toBe(true);
    });

    it('fails single-line ellipsis truncation (overflow:hidden + nowrap, content clipped)', () => {
        const el = visible(control('a very long truncated line', {}, 'p') as HTMLElement);
        el.style.textOverflow = 'ellipsis';
        el.style.overflow = 'hidden';
        el.style.whiteSpace = 'nowrap';
        setMetrics(el, { scrollWidth: 200, clientWidth: 100 });
        expect(sa11yTextTruncationCheck(el)).toBe(false);
    });

    it('passes ellipsis styling that is not actually clipped (sub-pixel tolerance)', () => {
        const el = visible(control('fits', {}, 'p') as HTMLElement);
        el.style.textOverflow = 'ellipsis';
        el.style.overflow = 'hidden';
        el.style.whiteSpace = 'nowrap';
        setMetrics(el, { scrollWidth: 100, clientWidth: 100 });
        expect(sa11yTextTruncationCheck(el)).toBe(true);
    });

    it('ignores whitespace-only text and treats a flex child as block-ish (not single-line truncation)', () => {
        const el = visible(control('', {}, 'div') as HTMLElement);
        el.appendChild(document.createTextNode('   ')); // whitespace-only: not visible text on its own
        const child = document.createElement('span');
        child.textContent = 'label';
        child.style.display = 'flex';
        el.appendChild(child);
        el.style.textOverflow = 'ellipsis';
        el.style.overflow = 'hidden';
        el.style.whiteSpace = 'nowrap';
        setMetrics(el, { scrollWidth: 200, clientWidth: 100 });
        expect(sa11yTextTruncationCheck(el)).toBe(true);
    });

    it('does not flag an ellipsis wrapper around a block-level child', () => {
        const el = visible(control('wrapper text', {}, 'span') as HTMLElement);
        el.style.textOverflow = 'ellipsis';
        el.style.overflow = 'hidden';
        el.style.whiteSpace = 'nowrap';
        const block = document.createElement('h1');
        block.style.display = 'block';
        block.textContent = 'heading';
        el.appendChild(block);
        setMetrics(el, { scrollWidth: 200, clientWidth: 100 });
        // has a block child -> its own scroll metrics don't represent single-line text truncation
        expect(sa11yTextTruncationCheck(el)).toBe(true);
    });
});
