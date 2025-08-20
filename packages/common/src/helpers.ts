/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * Convenience wrapper to prefix a standard header for console log messages.
 * Logging is enabled only when environment variable `SA11Y_DEBUG` is set.
 */
const sa11yAutoFilterListDefaultPackageName = 'sa11y-jest-automated-check-file-exclusion';

import axe from 'axe-core';
import * as fs from 'fs';
import path from 'path';
export function log(...args: unknown[]): void {
    // Probably not worth it to mock and test console logging for this helper util
    /* istanbul ignore next */
    if (process.env.SA11Y_DEBUG) console.log('♿[Sa11y]', ...args);
}

export function useFilesToBeExempted(): string[] {
    const packageName: string =
        process.env.SA11Y_AUTO_FILTER_LIST_PACKAGE_NAME ?? sa11yAutoFilterListDefaultPackageName;
    let getFilesToBeExempted: () => string[];
    if (packageName !== '') {
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            getFilesToBeExempted = require(packageName) as () => string[];
            const filesToBeExempted = getFilesToBeExempted();
            return filesToBeExempted;
        } catch (error) {
            if (packageName !== sa11yAutoFilterListDefaultPackageName) console.log('Package not found : ', packageName);
        }
    }
    return [];
}

export function useCustomRules(): string[] {
    const filePath = process.env.SA11Y_CUSTOM_RULES ?? '';
    if (filePath !== '') {
        try {
            // Read the file asynchronously
            const data = fs.readFileSync(filePath, 'utf-8');
            const { rules } = JSON.parse(data) as { rules: string[] };
            // Access the rules array
            return rules;
        } catch (err) {
            console.error('Error reading the custom ruleset file:', err);
        }
    }
    return [];
}

// Function to process files in a directory and push their content to a target array
export const processFiles = <T>(
    dir: string,
    targetArray: T[],
    extension: string,
    parser: (data: string) => T
): void => {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
        if (path.extname(file) === extension) {
            const filePath = path.join(dir, file);
            const fileData = parser(fs.readFileSync(filePath, 'utf8'));
            targetArray.push(fileData);
        }
    });
};

export const registerCustomRules = (
    changesData: { rules: axe.Rule[] },
    rulesData: axe.Rule[],
    checksData: axe.Check[]
): void => {
    const newChecks: axe.Check[] = [];
    const newRules: axe.Rule[] = [];

    // Read and parse existing rule changes
    const { rules } = changesData;
    const newRulesData = rulesData;
    const newChecksData = checksData;

    if (rules && Array.isArray(rules)) {
        newRules.push(...rules);
    }
    newRules.push(...newRulesData);
    newChecks.push(...newChecksData);

    // Configure axe with the new checks and rules
    const spec: axe.Spec = { rules: newRules, checks: newChecks };
    axe.configure(spec);
};

export function writeHtmlFileInPath(baseDir: string, fileName: string, htmlContent: string) {
    fs.mkdirSync(baseDir, { recursive: true });
    const fullFilePath = path.join(baseDir, fileName);
    fs.writeFileSync(fullFilePath, htmlContent, 'utf8');
}

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

export type A11yViolation = {
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
export function createA11yRuleViolation(a11yRule: A11yViolation, ruleIndex: number) {
    return `(${ruleIndex}) [${a11yRule.id}] ${a11yRule.description}
            * Error element(s) : ${a11yRule.errorElements.length}\n${createA11yErrorElements(a11yRule.errorElements)}
            * Help:
                • Help URL: ${a11yRule.helpUrl}
                • WCAG Criteria: ${a11yRule.wcagCriteria}`;
}
