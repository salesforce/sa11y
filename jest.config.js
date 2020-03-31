/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
module.exports = {
    // Note: Open coverage/index.html for coverage report
    coverageReporters: ['text', 'text-summary', 'html-spa'],
    coverageThreshold: {
        global: {
            // TODO: Debug why branch coverage is reported low even for 100% code cov
            //  https://github.com/istanbuljs/istanbuljs/search?q=branch+coverage&type=Issues
            branches: 0,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },
};
