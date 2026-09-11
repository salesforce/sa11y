/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * axe check `evaluate` for `sa11y-text-spacing-overflow-check` (SC 1.4.12 Text Spacing).
 *
 * Injects the WCAG text-spacing overrides on the element, forces a reflow, and flags (returns
 * false) only when the spacing NEWLY clips/overflows content (`scrollWidth > clientWidth` or
 * `scrollHeight > clientHeight`) that was not overflowing before. Comparing before vs after avoids
 * false positives from containers that already scroll. Inline styles are saved and restored so the
 * DOM is left unchanged.
 *
 * IMPORTANT: serialized with `.toString()` and re-created inside the browser (incl. iframes) by
 * axe — keep it self-contained (no imports / module-scope references). See `checks/index.ts`.
 */
export function sa11yTextSpacingOverflowCheck(node: HTMLElement): boolean {
    if (!node || !node.style) {
        return true;
    }
    const win = (node.ownerDocument && node.ownerDocument.defaultView) || window;
    const style = win.getComputedStyle(node);
    if (style.getPropertyValue('display') === 'none' || style.getPropertyValue('visibility') === 'hidden') {
        return true;
    }
    // Screen-reader-only / off-screen (SLDS `.slds-assistive-text`, clip-rect(0 0 0 0), 1px sr-only):
    // not visible to sighted users, so text-spacing clipping there is meaningless.
    const rect = node.getBoundingClientRect();
    if (rect.width <= 1 && rect.height <= 1) {
        return true;
    }
    // SC 1.4.12 applies to elements that directly render text. Require an own (direct-child) text
    // node — this skips pure layout containers (<div>s, menus) whose text lives only in descendants
    // (measuring their scroll box reflects child reflow, not this element's own text clipping), and
    // skips icon-only controls whose only text is an sr-only child span.
    let hasOwnText = false;
    for (let i = 0; i < node.childNodes.length; i += 1) {
        const cn = node.childNodes[i];
        if (cn.nodeType === 3 && (cn.textContent || '').trim() !== '') {
            hasOwnText = true;
            break;
        }
    }
    if (!hasOwnText) {
        return true;
    }
    const beforeX = node.scrollWidth > node.clientWidth;
    const beforeY = node.scrollHeight > node.clientHeight;
    const saved = {
        ws: node.style.getPropertyValue('word-spacing'),
        wsP: node.style.getPropertyPriority('word-spacing'),
        ls: node.style.getPropertyValue('letter-spacing'),
        lsP: node.style.getPropertyPriority('letter-spacing'),
        lh: node.style.getPropertyValue('line-height'),
        lhP: node.style.getPropertyPriority('line-height'),
    };
    node.style.setProperty('word-spacing', '0.16em', 'important');
    node.style.setProperty('letter-spacing', '0.12em', 'important');
    node.style.setProperty('line-height', '1.5', 'important');
    // Force a synchronous reflow so the post-override measurements below are accurate.
    node.getBoundingClientRect();
    const afterX = node.scrollWidth > node.clientWidth;
    const afterY = node.scrollHeight > node.clientHeight;
    node.style.removeProperty('word-spacing');
    node.style.removeProperty('letter-spacing');
    node.style.removeProperty('line-height');
    if (saved.ws) {
        node.style.setProperty('word-spacing', saved.ws, saved.wsP);
    }
    if (saved.ls) {
        node.style.setProperty('letter-spacing', saved.ls, saved.lsP);
    }
    if (saved.lh) {
        node.style.setProperty('line-height', saved.lh, saved.lhP);
    }
    const newlyClipped = (afterX && !beforeX) || (afterY && !beforeY);
    return !newlyClipped;
}
