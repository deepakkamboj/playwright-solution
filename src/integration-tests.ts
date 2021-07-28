/**
 * @license Copyright (c) Microsoft Corporation. All rights reserved.
 */
import { executePlaywrightTests } from './run-tests';

console.log("Current Working Directory: ", process.cwd());

//process.chdir('D:\\power-platform-ux\\packages\\playwright-solution');

//console.log("Current Working Directory: ", process.cwd());

executePlaywrightTests(process.cwd(), { browser: 'chromium', headless: false, group: '' });
