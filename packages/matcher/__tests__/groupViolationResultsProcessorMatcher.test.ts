/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { processA11yDetailsAndMessages } from '../src/groupViolationResultsProcessor';
import type { A11yError, Options } from '@sa11y/format';
import { createA11yErrorElements } from '@sa11y/common';

describe('createA11yErrorElements', () => {
    it('should format error elements with any, all, none and relatedNodes correctly', () => {
        const errorElements = [
            {
                html: '&lt;button&gt;',
                selectors: 'button.primary',
                hierarchy: 'div > button',
                any: 'Fix aria-label',
                all: 'Ensure contrast',
                none: 'Avoid tabindex',
                relatedNodeAny: 'div.wrapper',
                relatedNodeAll: 'div.container',
                relatedNodeNone: 'div.tab-wrapper',
                message: 'Custom issue message',
            },
        ];
        const output = createA11yErrorElements(errorElements);
        expect(output).toContain('HTML element : <button>');
        expect(output).toContain('CSS selector(s) : button.primary');
        expect(output).toContain('Error Message (Needs Review) : Custom issue message');
        expect(output).toContain('Fix aria-label');
        expect(output).toContain('Ensure contrast');
        expect(output).toContain('Avoid tabindex');
        expect(output).toContain('Related Nodes');
        expect(output).toContain('div.wrapper');
        expect(output).toContain('div.container');
        expect(output).toContain('div.tab-wrapper');
    });

    it('should handle missing optional fields gracefully', () => {
        const errorElements = [
            {
                html: '&lt;img&gt;',
                selectors: 'img.logo',
                hierarchy: 'div > img',
                any: '',
                all: '',
                none: '',
                relatedNodeAny: '',
                relatedNodeAll: '',
                relatedNodeNone: '',
            },
        ];
        const output = createA11yErrorElements(errorElements);
        expect(output).toContain('HTML element : <img>');
        expect(output).toContain('CSS selector(s) : img.logo');
    });
});

describe('processA11yDetailsAndMessages', () => {
    it('should generate failure messages grouped by rule', () => {
        const error: A11yError = {
            a11yResults: [
                {
                    id: 'color-contrast',
                    description:
                        'Ensures the contrast between foreground and background colors meets WCAG 2 AA contrast ratio thresholds',
                    helpUrl: 'https://example.com/contrast',
                    wcag: '1.4.3',
                    summary: 'Low contrast text',
                    html: '&lt;div&gt;Low contrast text&lt;/div&gt;',
                    selectors: 'div.low-contrast',
                    ancestry: 'body > div',
                    any: '',
                    all: 'Fix contrast',
                    none: '',
                    relatedNodeAny: 'span.helper-text',
                    relatedNodeAll: '',
                    relatedNodeNone: '',
                    message: 'Text has insufficient contrast',
                    key: '',
                    wcagData: undefined,
                    formatRelatedNodes: function (): string {
                        throw new Error('Function not implemented.');
                    },
                },
                {
                    id: 'color-contrast',
                    description:
                        'Ensures the contrast between foreground and background colors meets WCAG 2 AA contrast ratio thresholds',
                    helpUrl: 'https://example.com/contrast',
                    wcag: '1.4.3',
                    summary: 'Low contrast text again',
                    html: '&lt;span&gt;More low contrast&lt;/span&gt;',
                    selectors: 'span.low-contrast',
                    ancestry: 'body > span',
                    any: 'Fix again',
                    all: '',
                    none: 'Fix',
                    relatedNodeAny: 'div.helper-container',
                    relatedNodeAll: '',
                    relatedNodeNone: '',
                    key: '',
                    wcagData: undefined,
                    message: undefined,
                    formatRelatedNodes: function (): string {
                        throw new Error('Function not implemented.');
                    },
                },
            ],
        };

        const messages: string[] = [];
        processA11yDetailsAndMessages(error, messages);
        const result = messages[0];
        expect(result).toContain('The test has failed the accessibility check');
        expect(result).toContain('2 HTML elements have accessibility issue(s). 1 rules failed.');
        expect(result).toContain('[color-contrast]');
        expect(result).toContain('Help URL: https://example.com/contrast');
        expect(result).toContain('WCAG Criteria: 1.4.3');
        expect(result).toContain('Fix contrast');
    });

    it('should handle empty a11yResults gracefully', () => {
        const error: A11yError = {
            a11yResults: [],
            violations: [],
            length: 0,
            format: function (opts: Partial<Options>): string {
                throw new Error('Function not implemented.');
            },
            name: '',
            message: '',
        };
        const messages: string[] = [];
        processA11yDetailsAndMessages(error, messages);
        expect(messages[0]).toContain('0 HTML elements have accessibility issue(s). 0 rules failed.');
    });
});
