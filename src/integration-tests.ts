/**
 * @license Copyright (c) Microsoft Corporation. All rights reserved.
 */
import { executePlaywrightTests } from './run-tests';
import path from 'path';

const rootDir = path.join(process.cwd(), "dir1");
console.log("Current Working Directory: ", rootDir);

//process.chdir('D:\\power-platform-ux\\packages\\playwright-solution');

//console.log("Current Working Directory: ", process.cwd());

executePlaywrightTests(rootDir, { browser: 'chromium', headless: false, group: '' });
