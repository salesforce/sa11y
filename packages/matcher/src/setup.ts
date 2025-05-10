/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { useFilesToBeExempted, registerCustomRules } from '@sa11y/common';
import { AutoCheckOpts, getOriginalDocumentBodyHtml, setOriginalDocumentBodyHtml } from './automatic';
import { changesData, rulesData, checkData } from '@sa11y/preset-rules';

export const improvedChecksFilter = [
    'ui-email-stream-components/modules/emailStream/adminHealthInsights/__tests__/adminHealthInsights.test.js',
];

export type Sa11yOpts = {
    autoCheckOpts: AutoCheckOpts;
};

export const defaultSa11yOpts: Sa11yOpts = {
    autoCheckOpts: {
        runAfterEach: false,
        cleanupAfterEach: false,
        consolidateResults: false,
        runDOMMutationObserver: false,
        enableIncompleteResults: false,
    },
};

export function registerRemoveChild(): void {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const originalRemoveChild = Element.prototype.removeChild;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    (Element.prototype as any).removeChild = function (oldChild: Node): Node {
        if (oldChild.parentNode === this && !getOriginalDocumentBodyHtml()) {
            setOriginalDocumentBodyHtml(document?.body?.innerHTML ?? '');
        }
        return originalRemoveChild.call(this, oldChild);
    };
}

export function updateAutoCheckOpts(autoCheckOpts: AutoCheckOpts): void {
    autoCheckOpts.runAfterEach ||= !!process.env.SA11Y_AUTO;
    autoCheckOpts.cleanupAfterEach ||= !!process.env.SA11Y_CLEANUP;
    autoCheckOpts.consolidateResults ||= autoCheckOpts.runAfterEach;
    if (process.env.SA11Y_AUTO_FILTER?.trim().length) {
        autoCheckOpts.filesFilter ||= process.env.SA11Y_AUTO_FILTER.split(',');
    }
    const exemptedFiles = useFilesToBeExempted();
    if (exemptedFiles.length !== 0) {
        autoCheckOpts.filesFilter = (autoCheckOpts.filesFilter ?? []).concat(exemptedFiles);
    }

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

    autoCheckOpts.runDOMMutationObserver ||= !!process.env.SA11Y_ENABLE_DOM_MUTATION_OBSERVER;
    autoCheckOpts.enableIncompleteResults ||= !!process.env.SA11Y_ENABLE_INCOMPLETE_RESULTS;
}

export function registerCustomSa11yRules(): void {
    registerCustomRules(changesData, rulesData, checkData);
}
