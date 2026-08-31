/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * axe check `evaluate` for `sa11y-label-in-name-check` (SC 2.5.3 Label in Name).
 *
 * The accessible name (aria-label / aria-labelledby) must CONTAIN the visible label text. Only
 * elements with an explicit aria-label(ledby) are checked; when the accessible name is derived
 * from content it matches by definition. Returns false (violation) when the normalized visible
 * text is not a substring of the normalized accessible name.
 *
 * IMPORTANT: serialized with `.toString()` and re-created inside the browser (incl. iframes) by
 * axe — keep it self-contained (no imports / module-scope references). See `checks/index.ts`.
 */
export function sa11yLabelInNameCheck(node: Element): boolean {
    if (!node) {
        return true;
    }
    const norm = function (s: string): string {
        return (s || '')
            .replace(/[‘’“”]/g, "'")
            .replace(/[.,:;!?()[\]{}"'`|]/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();
    };
    const visible = norm(node.textContent || '');
    if (visible === '') {
        return true;
    }
    const doc = node.ownerDocument;
    if (!doc) {
        return true;
    }
    let accName = '';
    if (node.hasAttribute('aria-labelledby')) {
        const ids = (node.getAttribute('aria-labelledby') || '').split(/\s+/);
        const parts: string[] = [];
        for (let i = 0; i < ids.length; i++) {
            const el = doc.getElementById(ids[i]);
            if (el) {
                parts.push(el.textContent || '');
            }
        }
        accName = parts.join(' ');
    } else if (node.hasAttribute('aria-label')) {
        accName = node.getAttribute('aria-label') || '';
    } else {
        return true;
    }
    accName = norm(accName);
    if (accName === '') {
        return true;
    }
    return accName.indexOf(visible) !== -1;
}
