/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * axe check `evaluate` for `sa11y-text-truncation-check`.
 *
 * Flags (returns false) text that is truncated with an ellipsis (`text-overflow: ellipsis`) or
 * `-webkit-line-clamp` AND is actually clipped.
 *
 * NOTE ON NAMING: this is a single-viewport truncation detector, NOT a reflow (SC 1.4.10) test — it
 * inspects the DOM at whatever width it happens to run at and never resizes the viewport. To get
 * real reflow coverage the FTest harness runs it again at 200% / 400% zoom; truncation found at
 * 400% is the reflow failure. It was renamed from `Resize-reflow-textoverflow` to stop claiming
 * reflow coverage it does not have on its own.
 *
 * False-positive hardening (see W-22990841 spike triage):
 *  - Skips screen-reader-only nodes (SLDS `.slds-assistive-text`, clip-rect(0 0 0 0), 1px sr-only)
 *    and icon-only controls whose only text is an sr-only child — `innerText` used to count that
 *    text as visible and mis-flag them.
 *  - Uses a 1px threshold so sub-pixel rounding on SLDS tab links is not treated as clipping.
 *  - Gates the ellipsis branch to genuine single-line truncation (overflow:hidden + nowrap + no
 *    block-level child), so a `slds-truncate` wrapper around a block element (e.g. an `h1`) is not
 *    flagged, and no longer uses vertical scroll for the single-line case.
 *
 * IMPORTANT: serialized with `.toString()` and re-created inside the browser (incl. iframes) by
 * axe — keep it self-contained (no imports / module-scope references). See `checks/index.ts`.
 */
export function sa11yTextTruncationCheck(node: HTMLElement): boolean {
    if (!node) {
        return true;
    }
    const win = (node.ownerDocument && node.ownerDocument.defaultView) || window;

    // Is `el` invisible to sighted users? Covers display:none / visibility:hidden, zero-size boxes,
    // and the SLDS screen-reader-only pattern (position:absolute + clip:rect(0 0 0 0)). Text inside
    // such nodes is available to assistive tech but never rendered, so it must not count as visible.
    const isHidden = function (el: Element): boolean {
        const cs = win.getComputedStyle(el);
        if (cs.getPropertyValue('display') === 'none' || cs.getPropertyValue('visibility') === 'hidden') {
            return true;
        }
        const rect = el.getBoundingClientRect();
        if (rect.width <= 1 && rect.height <= 1) {
            return true;
        }
        const clip = cs.getPropertyValue('clip').replace(/px|,| /g, '');
        return cs.getPropertyValue('position') === 'absolute' && clip === 'rect(0000)';
    };

    // Does the subtree contain any text a sighted user can actually see (ignoring screen-reader-only
    // / hidden branches)? Replaces `node.innerText`, which includes sr-only text and so mis-flagged
    // icon-only controls (icon + `.slds-assistive-text`) as having a visible label.
    const hasVisibleText = function (root: Element): boolean {
        const stack: Element[] = [root];
        while (stack.length > 0) {
            const el = stack.pop() as Element;
            if (isHidden(el)) {
                continue;
            }
            const kids = el.childNodes;
            for (let i = 0; i < kids.length; i += 1) {
                const cn = kids[i];
                if (cn.nodeType === 3) {
                    if ((cn.textContent || '').trim() !== '') {
                        return true;
                    }
                } else if (cn.nodeType === 1) {
                    stack.push(cn as Element);
                }
            }
        }
        return false;
    };

    if (isHidden(node) || !hasVisibleText(node)) {
        return true;
    }

    // A block-level child means this element is a wrapper around block content (e.g. a
    // `slds-truncate` <span> around an <h1>); its own scroll metrics don't reflect text truncation.
    const hasBlockChild = function (el: Element): boolean {
        const kids = el.children;
        for (let i = 0; i < kids.length; i += 1) {
            const d = win.getComputedStyle(kids[i]).getPropertyValue('display');
            if (d === 'block' || d === 'flex' || d === 'grid' || d === 'table' || d === 'list-item') {
                return true;
            }
        }
        return false;
    };

    const style = win.getComputedStyle(node);

    // Single-line ellipsis truncation is only meaningful with overflow:hidden + white-space:nowrap
    // and no block child. Use a >1px threshold to ignore sub-pixel rounding (SLDS tab links report a
    // fractional scrollWidth-clientWidth diff while being fully visible).
    /* istanbul ignore next: requires real layout, exercised by the browser FTest run */
    if (
        style.getPropertyValue('text-overflow') === 'ellipsis' &&
        style.getPropertyValue('overflow') === 'hidden' &&
        style.getPropertyValue('white-space') === 'nowrap' &&
        !hasBlockChild(node)
    ) {
        return !(node.scrollWidth - node.clientWidth > 1);
    }

    // Multi-line clamp truncation (vertical).
    const clamp = style.getPropertyValue('-webkit-line-clamp');
    /* istanbul ignore next: requires real layout, exercised by the browser FTest run */
    if (
        style.getPropertyValue('display') === '-webkit-box' &&
        clamp &&
        clamp !== 'none' &&
        clamp !== '0' &&
        style.getPropertyValue('overflow') === 'hidden' &&
        style.getPropertyValue('-webkit-box-orient') === 'vertical'
    ) {
        return !(node.scrollHeight - node.clientHeight > 1);
    }
    return true;
}
