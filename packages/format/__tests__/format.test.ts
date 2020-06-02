/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as axe from 'axe-core';
import { beforeEachSetup, domWithA11yIssues, domWithNoA11yIssues } from '@sa11y/test-utils';
import { A11yError, Options, sortViolations } from '..';

async function getA11yError(dom: string): Promise<A11yError> {
    document.body.innerHTML = dom;
    const violations = await axe.run(document).then((results) => results.violations);
    return new A11yError(violations);
}

beforeEach(beforeEachSetup);

describe('a11y Results Formatter', () => {
    it.each([domWithA11yIssues, domWithNoA11yIssues])(
        'should format a11y issues as expected with default options for dom %#',
        async (dom) => {
            const a11yError = await getA11yError(dom);
            expect(a11yError.format()).toMatchSnapshot();
            expect(a11yError.length).toMatchSnapshot();
            expect(a11yError.message).toMatchSnapshot();
        }
    );

    it.each([{ formatter: JSON.stringify }, { highlighter: undefined }, {}, undefined, null])(
        'should format using specified options: %#',
        async (formatOptions: Options) => {
            expect((await getA11yError(domWithA11yIssues)).format(formatOptions)).toMatchSnapshot();
        }
    );

    it('should sort a11y issues by impact', () => {
        const a11yIssues = [
            { impact: undefined },
            { impact: undefined },
            { impact: 'moderate' },
            { impact: 'minor' },
            { impact: 'critical' },
            { impact: 'critical' },
        ];
        sortViolations(a11yIssues as axe.Result[]);
        expect(a11yIssues[0].impact).toEqual('critical');
        expect(a11yIssues[1].impact).toEqual('critical');
        expect(a11yIssues[2].impact).toEqual('moderate');
        expect(a11yIssues[3].impact).toBeUndefined(); // Sort by "defaultImpact"
        expect(a11yIssues[4].impact).toBeUndefined();
        expect(a11yIssues[5].impact).toEqual('minor');
    });
});
