/*
 * Copyright (c) 2026, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from '@jest/globals';
import { getOriginalDocumentBodyHtml, registerRemoveChild, setOriginalDocumentBodyHtml } from '../src';

describe('registerRemoveChild', () => {
    const initialDOM = '<ul id="list"><li id="first">first</li><li id="second">second</li></ul>';

    /**
     * Remove the list item with the given ID from the list
     */
    function removeListItem(id: string): void {
        const list = document.getElementById('list') as HTMLElement;
        list.removeChild(document.getElementById(id) as HTMLElement);
    }

    beforeEach(() => {
        document.body.innerHTML = initialDOM;
    });

    afterEach(() => {
        // Remove the patched removeChild, falling back to the one of Node
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        delete (Element.prototype as any).removeChild;
        setOriginalDocumentBodyHtml(null);
        document.body.innerHTML = '';
    });

    it('should save the DOM on the first node removal', () => {
        registerRemoveChild();
        removeListItem('first');
        removeListItem('second');
        expect(getOriginalDocumentBodyHtml()).toBe(initialDOM);
        expect(document.getElementById('list')?.children).toHaveLength(0);
    });

    it('should save the DOM on the first node removal allowed by the given check', () => {
        let canSaveDOM = false;
        const shouldSaveDOM = jest.fn(() => canSaveDOM);
        registerRemoveChild(shouldSaveDOM);

        removeListItem('first');
        expect(shouldSaveDOM).toHaveBeenCalledTimes(1);
        expect(getOriginalDocumentBodyHtml()).toBeNull();

        canSaveDOM = true;
        const domBeforeSave = document.body.innerHTML;
        removeListItem('second');
        expect(getOriginalDocumentBodyHtml()).toBe(domBeforeSave);
        expect(domBeforeSave).not.toBe(initialDOM);
        expect(domBeforeSave).toContain('second');
    });

    it('should not overwrite the saved DOM', () => {
        const shouldSaveDOM = jest.fn(() => true);
        registerRemoveChild(shouldSaveDOM);
        removeListItem('first');
        removeListItem('second');
        expect(getOriginalDocumentBodyHtml()).toBe(initialDOM);
        // The check isn't needed anymore once the DOM is saved
        expect(shouldSaveDOM).toHaveBeenCalledTimes(1);
    });
});
