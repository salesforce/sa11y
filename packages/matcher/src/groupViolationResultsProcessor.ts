/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
// a11yProcessorCore.ts
import { A11yError } from '@sa11y/format';
export type ErrorElement = {
    html: string;
    selectors: string;
    hierarchy: string;
    any: string;
    all: string;
    none: string;
    relatedNodeAny: string;
    relatedNodeAll: string;
    relatedNodeNone: string;
    message?: string;
};

type A11yViolation = {
    id: string;
    description: string;
    helpUrl: string;
    wcagCriteria: string;
    summary: string;
    errorElements: ErrorElement[];
};

const formatSpacing = '\t'.repeat(4);
const formatForAxeMessage = `\n${formatSpacing}\t`;

const axeMessages = {
    toSolveAny: `${formatForAxeMessage}- More Info: To solve the problem, you need to fix at least (1) of the following:\n`,
    toSolveFirst: `${formatForAxeMessage}- More Info: To solve the problem, you need to fix one of the following:\n`,
    toSolveSecond: `${formatForAxeMessage}- And fix the following:\n`,
    relatedNodes: `${formatForAxeMessage}- Related Nodes: \n`,
};
/**
 * Create a test failure html elements array grouped by rule violation
 */
export function createA11yErrorElements(errorElements: ErrorElement[]) {
    const a11yErrorElements: string[] = [];
    let onlyOneSummary = false;

    const appendRelatedNodes = (errorMessage: string, relatedNodes: string | undefined) => {
        return relatedNodes ? `${errorMessage}${axeMessages.relatedNodes}${relatedNodes}` : errorMessage;
    };

    errorElements.forEach((errorElement, index) => {
        let errorMessage = `${formatSpacing}(${index + 1}) - HTML element : ${errorElement.html
            .replace(/&lt;/g, '<')
            .replace(/&gt;/, '>')}`;
        errorMessage += `${formatForAxeMessage}- CSS selector(s) : ${errorElement.selectors.replace(/&gt;/, '>')}`;
        errorMessage += `${formatForAxeMessage}- HTML Tag Hierarchy : ${errorElement.hierarchy}`;
        if (errorElement.message)
            errorMessage += `${formatForAxeMessage}- Error Message (Needs Review) : ${errorElement.message}`;
        const isAny = errorElement.any?.length > 0;
        const isAll = errorElement.all?.length > 0;
        const isNone = errorElement.none?.length > 0;

        if (!onlyOneSummary) {
            if (isAny) {
                errorMessage += `${axeMessages.toSolveAny}${errorElement.any}`;
                errorMessage = appendRelatedNodes(errorMessage, errorElement.relatedNodeAny);
                if (isAll) {
                    errorMessage += `${axeMessages.toSolveSecond}${errorElement.all}`;
                    errorMessage = appendRelatedNodes(errorMessage, errorElement.relatedNodeAll);
                }
                if (isNone) {
                    errorMessage += `${axeMessages.toSolveSecond}${errorElement.none}`;
                    errorMessage = appendRelatedNodes(errorMessage, errorElement.relatedNodeNone);
                }
            } else if (isAll) {
                errorMessage += `${axeMessages.toSolveFirst}${errorElement.all}`;
                errorMessage = appendRelatedNodes(errorMessage, errorElement.relatedNodeAll);
                if (isNone) {
                    errorMessage += `${axeMessages.toSolveSecond}${errorElement.none}`;
                    errorMessage = appendRelatedNodes(errorMessage, errorElement.relatedNodeNone);
                }
            } else {
                if (isNone) {
                    errorMessage += `${axeMessages.toSolveFirst}${errorElement.none}`;
                    errorMessage = appendRelatedNodes(errorMessage, errorElement.relatedNodeNone);
                }
            }
        } else {
            errorMessage = appendRelatedNodes(errorMessage, errorElement.relatedNodeAny);
        }
        onlyOneSummary = isAny && !isAll && !isNone;
        a11yErrorElements.push(errorMessage);
    });

    return a11yErrorElements.join('\n');
}

/**
 * Create a test failure violation error message grouped by rule violation
 */
function createA11yRuleViolation(a11yRule: A11yViolation, ruleIndex: number) {
    return `(${ruleIndex}) [${a11yRule.id}] ${a11yRule.description}
            * Error element(s) : ${a11yRule.errorElements.length}\n${createA11yErrorElements(a11yRule.errorElements)}
            * Help:
                • Help URL: ${a11yRule.helpUrl}
                • WCAG Criteria: ${a11yRule.wcagCriteria}`;
}

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
