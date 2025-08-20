/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
// a11yProcessorCore.ts
import { A11yError } from '@sa11y/format';
import { createA11yRuleViolation } from '@sa11y/common';
import type { A11yViolation } from '@sa11y/common';

/**
 * Create a test processA11yDetailsAndMessages violation error message grouped by rule violation
 */
export function processA11yDetailsAndMessages(error: A11yError, a11yFailureMessages: string[]) {
    const a11yRuleViolations: { [key: string]: A11yViolation } = {};
    let a11yRuleViolationsCount = 0;
    let a11yErrorElementsCount = 0;
    error.a11yResults.forEach((a11yResult) => {
        a11yErrorElementsCount++;
        if (!(a11yRuleViolations as never)[a11yResult.wcag]) {
            a11yRuleViolationsCount++;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            a11yRuleViolations[a11yResult.wcag] = {
                id: a11yResult.id,
                description: a11yResult.description,
                helpUrl: a11yResult.helpUrl,
                wcagCriteria: a11yResult.wcag,
                summary: a11yResult.summary,
                errorElements: [],
            };
        }
        a11yRuleViolations[a11yResult.wcag].errorElements.push({
            html: a11yResult.html,
            selectors: a11yResult.selectors,
            hierarchy: a11yResult.ancestry,
            any: a11yResult.any,
            all: a11yResult.all,
            none: a11yResult.none,
            relatedNodeAny: a11yResult.relatedNodeAny,
            relatedNodeAll: a11yResult.relatedNodeAll,
            relatedNodeNone: a11yResult.relatedNodeNone,
            message: a11yResult?.message,
        });
    });

    const a11yFailureMessage = `
${error.renderedDOMSavedFileName ? `HTML Source: ${error.renderedDOMSavedFileName}\n` : ''}
The test has failed the accessibility check. Accessibility Stacktrace/Issues:
${a11yErrorElementsCount} HTML elements have accessibility issue(s). ${a11yRuleViolationsCount} rules failed.

${Object.values(a11yRuleViolations)
    .map((a11yRuleViolation, index) => createA11yRuleViolation(a11yRuleViolation, index + 1))
    .join('\n')}

    
For more info about automated accessibility testing: https://sfdc.co/a11y-test
For tips on fixing accessibility bugs: https://sfdc.co/a11y
For technical questions regarding Salesforce accessibility tools, contact our Sa11y team: http://sfdc.co/sa11y-users
For guidance on accessibility related specifics, contact our A11y team: http://sfdc.co/tmp-a11y
    `;
    a11yFailureMessages.push(a11yFailureMessage);
}
