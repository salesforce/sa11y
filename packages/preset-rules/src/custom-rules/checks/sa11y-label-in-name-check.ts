/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/*
 * axe injects itself as a global and reconstructs each check's `evaluate` in the global scope, so
 * the running `axe` (and its `commons`) is resolvable inside this function at runtime — in the
 * browser bundle AND under @sa11y/jest (axe-core sets `window.axe`). `commons` is not part of
 * axe-core's public TS types, so declare the slice we use. `declare` emits no JS, and the
 * identifier stays literally `axe` in the serialized function (unlike a bundler-renamed import).
 */
declare const axe: {
    commons: {
        text: {
            visibleVirtual(vNode: unknown, screenReader?: boolean, noRecursing?: boolean): string;
            accessibleTextVirtual(vNode: unknown): string;
            isHumanInterpretable(str: string): number;
        };
    };
};

/**
 * axe check `evaluate` for `sa11y-label-in-name-check` (SC 2.5.3 Label in Name).
 *
 * The accessible name must CONTAIN the visible label text so speech-input users can activate a
 * control by the name they see. Both sides are computed with axe's own `commons` — the same
 * machinery axe's built-in `label-content-name-mismatch` uses — rather than hand-rolled logic:
 *  - visible label  → `axe.commons.text.visibleVirtual(vNode, false, false)` — text visible to a
 *    sighted user only. This is the key fix over the previous `node.textContent`, which pulled in
 *    sr-only / hidden / collapsed descendant text and produced false positives on parent
 *    `treeitem`s (Setup nav) whose hidden subtree text was no longer a substring of a short label.
 *  - accessible name → `axe.commons.text.accessibleTextVirtual(vNode)` — full ACCNAME resolution
 *    (aria-label, aria-labelledby id-chains, `<label>`, `title`, content).
 *
 * Returns true (pass / not-applicable) for elements out of scope (hidden, disabled, presentational)
 * or with no human-interpretable visible label (icon / symbol only). Returns false only when a real
 * visible label is not contained (as an ordered run of tokens) in the accessible name.
 *
 * IMPORTANT: serialized with `.toString()` and re-created inside the browser (incl. iframes) by
 * axe — keep it self-contained (no imports / module-scope references except the `axe` global).
 * See `checks/index.ts`. axe passes `(node, options, virtualNode)`.
 */
export function sa11yLabelInNameCheck(node: Element, _options: unknown, virtualNode: unknown): boolean {
    if (!node || !virtualNode) {
        return true;
    }
    // Applicability: elements outside the accessibility tree or non-interactive are out of scope.
    if (node.getAttribute) {
        if (node.getAttribute('aria-hidden') === 'true' || node.hasAttribute('disabled')) {
            return true;
        }
        const role = node.getAttribute('role');
        if (role === 'none' || role === 'presentation') {
            return true;
        }
    }

    const visibleRaw = axe.commons.text.visibleVirtual(virtualNode, false, false);
    // Exempt controls whose visible label is not human-interpretable (icon / symbol / emoji only).
    if (axe.commons.text.isHumanInterpretable(visibleRaw) < 1) {
        return true;
    }
    const accNameRaw = axe.commons.text.accessibleTextVirtual(virtualNode);

    // Normalize to lowercase tokens: NFKC fold, unify smart quotes, drop punctuation, split on space.
    const tokenize = function (s: string): string[] {
        return (s || '')
            .normalize('NFKC')
            .replace(/[‘’“”]/g, "'")
            .replace(/[.,:;!?()[\]{}"'`|]/g, '')
            .toLowerCase()
            .split(/\s+/)
            .filter(function (t: string): boolean {
                return t !== '';
            });
    };
    const visible = tokenize(visibleRaw);
    const accName = tokenize(accNameRaw);
    if (visible.length === 0 || accName.length === 0) {
        return true;
    }

    // WCAG 2.5.3: the visible label must appear in the accessible name. Require the visible tokens as
    // a contiguous ordered run within the accessible-name tokens — avoids the substring over-match of
    // `indexOf` (e.g. "ok" inside "booking") while still allowing extra words around the label.
    const containsRun = function (haystack: string[], needle: string[]): boolean {
        if (needle.length > haystack.length) {
            return false;
        }
        for (let i = 0; i + needle.length <= haystack.length; i += 1) {
            let matched = true;
            for (let j = 0; j < needle.length; j += 1) {
                if (haystack[i + j] !== needle[j]) {
                    matched = false;
                    break;
                }
            }
            if (matched) {
                return true;
            }
        }
        return false;
    };
    return containsRun(accName, visible);
}
