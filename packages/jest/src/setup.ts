/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { toBeAccessible } from './matcher';
import { useFilesToBeExempted, registerCustomRules } from '@sa11y/common';
import {
    AutoCheckOpts,
    registerSa11yAutomaticChecks,
    getOriginalDocumentBodyHtml,
    setOriginalDocumentBodyHtml,
    RenderedDOMSaveOpts,
} from './automatic';
import { expect } from '@jest/globals';
import { changesData, rulesData, checkData } from '@sa11y/preset-rules';

/**
 * Options to be passed on to {@link setup}
 */
export type Sa11yOpts = {
    autoCheckOpts: AutoCheckOpts;
    renderedDOMSaveOpts: RenderedDOMSaveOpts
    // TODO (feat): add support for global opts to control formatting, filtering etc
    // runOpts: RunOpts; // including ruleset, include/exclude selectors etc
    // formatOpts: FormatOpts; // including format.Options etc
    // filterOpts: FilterOpts; // including exception list filtering etc
};

/**
 * Default options for sa11y jest matcher
 */
const defaultSa11yOpts: Sa11yOpts = {
    autoCheckOpts: {
        runAfterEach: false,
        cleanupAfterEach: false,
        consolidateResults: false,
        runDOMMutationObserver: false,
        enableIncompleteResults: false,
    },
    renderedDOMSaveOpts: {
        renderedDOMDumpDirPath: '',
    }
};

function registerRemoveChild() {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const originalRemoveChild = Element.prototype.removeChild;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    (Element.prototype as any).removeChild = function (oldChild: Node): Node {
        if (oldChild.parentNode === this) {
            // Your custom implementation here
            if (!getOriginalDocumentBodyHtml()) {
                setOriginalDocumentBodyHtml(document?.body?.innerHTML ?? '');
            }
        }

        return originalRemoveChild.call(this, oldChild);
    };
}

const improvedChecksFilter = [
    'ui-email-stream-components/modules/emailStream/adminHealthInsights/__tests__/adminHealthInsights.test.js',
];

/**
 * Register Sa11y Jest API and automatic checks depending on {@link Sa11yOpts}
 * @param opts - {@link Sa11yOpts} to opt-in to automatic checks
 */
export function setup(opts: Sa11yOpts = defaultSa11yOpts): void {
    if (process.env.SA11Y_AUTO) {
        const testPath = expect.getState().testPath ?? '';
        const ignoreImprovedChecks = improvedChecksFilter.some((fileName) =>
            testPath.toLowerCase().includes(fileName.toLowerCase())
        );
        if (!ignoreImprovedChecks) {
            registerRemoveChild();
        }
    }
    registerSa11yMatcher();
    registerCustomRules(changesData, rulesData, checkData);
    // Set defaults from env vars
    const autoCheckOpts = opts.autoCheckOpts;
    autoCheckOpts.runAfterEach ||= !!process.env.SA11Y_AUTO;
    // Consolidate results if automatic checks is enabled
    autoCheckOpts.consolidateResults ||= autoCheckOpts.runAfterEach;
    autoCheckOpts.cleanupAfterEach ||= !!process.env.SA11Y_CLEANUP;
    if (process.env.SA11Y_AUTO_FILTER?.trim().length)
        autoCheckOpts.filesFilter ||= process.env.SA11Y_AUTO_FILTER.split(',');
    const exemptedFiles = useFilesToBeExempted();
    if (exemptedFiles.length !== 0) {
        autoCheckOpts.filesFilter = (autoCheckOpts.filesFilter ?? []).concat(exemptedFiles);
    }
    // TODO remove @W-14447754 - add files filter
    autoCheckOpts.filesFilter = (autoCheckOpts.filesFilter ?? []).concat([
        'ui-help-components/modules/forceHelp/linkToReleaseNotes/__tests__/linkToReleaseNotes.spec.js',
        'ui-help-components/modules/forceHelp/linkToNonSalesforceResource/__tests__/linkToNonSalesforceResource.spec.js',
        'ui-help-components/modules/forceHelp/linkToAppexchange/__tests__/linkToAppexchange.spec.js',
        'ui-help-components/modules/forceHelp/linkToTrailblazer/__tests__/linkToTrailblazer.spec.js',
        'ui-help-components/modules/forceHelp/linkToVidyard/__tests__/linkToVidyard.spec.js',
        'ui-help-components/modules/forceHelp/linkToSalesforceDevelopers/__tests__/linkToSalesforceDevelopers.spec.js',
        'ui-help-components/modules/forceHelp/linkToWebinar/__tests__/linkToWebinar.spec.js',
        'ui-help-components/modules/forceHelp/linkToTrust/__tests__/linkToTrust.spec.js',
        'ui-help-components/modules/forceHelp/linkToPartnerCommunity/__tests__/linkToPartnerCommunity.spec.js',
        'ui-help-components/modules/forceHelp/linkToDocResource/__tests__/linkToDocResource.spec.js',
        'ui-help-components/modules/forceHelp/searchResultItem/__tests__/searchResultItem.spec.js',
        'ui-help-components/modules/forceHelp/linkToTrailhead/__tests__/linkToTrailhead.spec.js',
        'ui-help-components/modules/forceHelp/linkToSalesforceSuccess/__tests__/linkToSalesforceSuccess.spec.js',
        'ui-help-components/modules/forceHelp/linkToSalesforceHelp/__tests__/linkToSalesforceHelp.spec.js',
        'ui-help-components/modules/forceHelp/link/__tests__/link.spec.js',
        'ui-help-components/modules/forceHelp/searchResults/__tests__/searchResults.spec.js',
        'ui-help-components/modules/forceHelp/linkToKnownIssue/__tests__/linkToKnownIssue.spec.js',
    ]);

    // set the flag to true to run sa11y in DOM Mutation Observer mode
    autoCheckOpts.runDOMMutationObserver ||= !!process.env.SA11Y_ENABLE_DOM_MUTATION_OBSERVER;
    autoCheckOpts.enableIncompleteResults ||= !!process.env.SA11Y_ENABLE_INCOMPLETE_RESULTS;

    const renderedDOMSaveOpts = opts.renderedDOMSaveOpts;
    registerSa11yAutomaticChecks(autoCheckOpts, renderedDOMSaveOpts);
}
/**
 * Register accessibility helpers toBeAccessible as jest matchers
 */
export function registerSa11yMatcher(): void {
    if (expect !== undefined) {
        expect.extend({ toBeAccessible });
    } else {
        throw new Error(
            "Unable to find Jest's expect function." +
                '\nPlease check your Jest installation and that you have added @sa11y/jest correctly to your jest configuration.' +
                '\nSee https://github.com/salesforce/sa11y/tree/master/packages/jest#readme for help.'
        );
    }
}
