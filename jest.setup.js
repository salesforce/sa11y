/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
// eslint-disable-next-line no-undef
jest.setTimeout(15000);

// jsdom defines HTMLCanvasElement.prototype.getContext but does not implement it
// without the `canvas` package; axe-core color-contrast checks then spam
// "Not implemented: HTMLCanvasElement.prototype.getContext" during unit tests.
// Stub only when HTMLCanvasElement exists (jsdom) and getContext is present.
// eslint-disable-next-line no-undef
if (typeof HTMLCanvasElement !== 'undefined') {
    // eslint-disable-next-line no-undef
    HTMLCanvasElement.prototype.getContext = () => null;
}
