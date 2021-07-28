/**
 * @license Copyright (c) Microsoft Corporation. All rights reserved.
 */

import { BrowserContext, Page, ElementHandle, Request as IBrowserRequest, Route as IBrowserRoute } from 'playwright';

export * from './testUtils';
export * from './page';

/**
 * The valid arts integration run types.
 */
 export type RunType =
 'pr' |
 'nightly' |
 'runner';

/**
 * The environment variables.
 */
export enum EnvironmentVariable {
    AUTO_OPEN_DEVTOOLS = 'AUTO_OPEN_DEVTOOLS',
    BASE_URL = 'BASE_URL',
    BROWSER = 'BROWSER',
    COLLECT_COVERAGE = 'COLLECT_COVERAGE',
    ENABLE_LOGGING = 'ENABLE_LOGGING',
    HEADLESS = 'HEADLESS',
    IGNORE_FLAKY_TESTS = 'IGNORE_FLAKY_TESTS',
    IGNORE_HTTPS_ERRORS = 'IGNORE_HTTPS_ERRORS',
    INT_TESTS = 'INT_TESTS',
    RECORD_VIDEO = 'RECORD_VIDEO',
    RUN_ENV = 'RUN_ENV',
    RUN_TYPE = 'RUN_TYPE',
    TRACE_DEBUG_ENABLED = 'TRACE_DEBUG_ENABLED',
    SLOW_DOWN_MS = 'SLOW_DOWN_MS',
    USE_PASSWORDS_FROM_ENVIRONMENT = 'USE_PASSWORDS_FROM_ENVIRONMENT',
}

export {
    BrowserContext,
    ElementHandle,
    IBrowserRequest,
    IBrowserRoute,
    Page,
};