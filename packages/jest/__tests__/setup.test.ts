/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { registerSa11yMatcher, setup } from '../src/setup';
import { expect, jest } from '@jest/globals';

type JsdomVirtualConsole = {
    on(event: 'jsdomError', listener: (error: Error) => void): void;
    off(event: 'jsdomError', listener: (error: Error) => void): void;
};

function getVirtualConsole(): JsdomVirtualConsole {
    return (window as unknown as { _virtualConsole: JsdomVirtualConsole })._virtualConsole;
}

function collectGetContextNotImplemented(): { ctx: CanvasRenderingContext2D | null; logged: boolean } {
    const errors: Error[] = [];
    const virtualConsole = getVirtualConsole();
    const onError = (error: Error): void => {
        errors.push(error);
    };
    virtualConsole.on('jsdomError', onError);
    try {
        const ctx = document.createElement('canvas').getContext('2d');
        const logged = errors.some((error) => error.message.includes('HTMLCanvasElement.prototype.getContext'));
        return { ctx, logged };
    } finally {
        virtualConsole.off('jsdomError', onError);
    }
}

describe('jest setup', () => {
    registerSa11yMatcher();
    it('should define matcher on expect object', () => {
        expect(expect['toBeAccessible']).toBeDefined();
    });

    it('should stub HTMLCanvasElement.prototype.getContext so jsdom does not log Not implemented', () => {
        setup();
        const { ctx, logged } = collectGetContextNotImplemented();
        expect(ctx).toBeNull();
        expect(logged).toBe(false);
    });

    it('should not overwrite getContext when a stub is already defined', () => {
        const proto = HTMLCanvasElement.prototype;
        const originalGetContext: typeof proto.getContext = proto.getContext.bind(proto);
        const existingStub = jest.fn(() => null);
        proto.getContext = existingStub as unknown as typeof proto.getContext;
        try {
            setup();
            expect(Object.getOwnPropertyDescriptor(proto, 'getContext')?.value).toBe(existingStub);
        } finally {
            proto.getContext = originalGetContext;
        }
    });

    /* Skipped: Difficult to mock the global "expect" when we are `import {expect} from '@jest/globals'` */
    it.skip('should throw error when global expect is undefined', () => {
        const globalExpect = expect as jest.Expect;
        expect(globalExpect).toBeDefined();
        expect(registerSa11yMatcher).not.toThrow();
        try {
            global.expect = undefined;
            globalExpect(registerSa11yMatcher).toThrowErrorMatchingSnapshot();
        } finally {
            global.expect = globalExpect;
        }
    });
});
