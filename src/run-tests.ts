/**
 * @license Copyright (c) Microsoft Corporation. All rights reserved.
 */

import { Config } from '@jest/types';
import { runCLI as runJestCLI } from 'jest';
import type { AggregatedResult } from '@jest/test-result';
import path from 'path';
import { emptyDirSync, existsSync, writeFileSync } from 'fs-extra';

/**
 * Writes jest config file
 * @param jestConfigPath
 * @param jestConfig
 * @returns jest config file
 */
async function writeJestConfigFile(jestConfigPath: string, jestConfig: any): Promise<void> {
  try {
    console.log(`Creating 'jest.config.json' at ${jestConfigPath}`);
    writeFileSync(jestConfigPath, JSON.stringify(jestConfig), { flag: 'w' });
  } catch (e) {
    if (e instanceof Error) {
      console.log(e.name + '\n');
      console.log(e.message + '\n');
      if (e.stack) {
        console.log(e.stack + '\n');
      }
    } else {
      console.log(`Unknown error while writing to ${jestConfigPath}`);
    }

    process.exit(1);
  }
}

export async function executePlaywrightTests(
  integrationTestsPackagePath: string,
  options: {
    browser: string;
    headless: boolean;
    group: string;
  },
  testNamePattern?: string
): Promise<AggregatedResult | undefined> {
  const jestConfig: Config.InitialOptions = {
    name: 'integration',
    displayName: 'Integration Tests',
    verbose: true,
    preset: 'jest-playwright-preset',
    testMatch: ['**/?(*.)+(spec|test).+(ts|js)'],
    transform: {
      '^.+\\.(ts)$': 'ts-jest'
    },
    testTimeout: 120000,
    testRunner: 'jest-circus/runner',
    reporters: [
      'default',
      [
        'jest-trx-results-processor',
        {
          outputFile: process.cwd() + '/artifacts/testResults/tests-results.trx'
        }
      ],
      [
        "jest-junit",
         {
          "outputDirectory": process.cwd() + "/artifacts/testReports",
          "outputName": "test_report.xml"
        }
      ]
    ],

    testEnvironment: process.cwd() + '/src/framework/playwrightEnvironment.ts',
    setupFilesAfterEnv: ['expect-playwright', process.cwd() + '/src/framework/setupFilesAfterEnv.ts'],

    // jest-playwright.config.js
    testEnvironmentOptions: {
      'jest-playwright': {
        browsers: [options.browser || 'firefox'],
        launchOptions: {
          headless: options.headless,
          args: options.headless
            ? [
                '--headless',
                '--disable-dev-shm-usage',
                '--no-sandbox',
                '--disable-gpu',
                '--disable-extensions'
              ]
            : ['--start-maximized', '--no-sandbox', '--disable-web-security'],
          devtools: process.env.AUTO_OPEN_DEVTOOLS === 'true',
          slowMo: process.env.SLOW_DOWN_MS
        },
        contextOptions: {
          recordVideo:
            process.env.RECORD_VIDEO === '1'
              ? {
                  dir: process.cwd() + '/artifacts/videos',
                  size: {
                    width: 1920,
                    height: 1280
                  }
                }
              : undefined,
          recordHar:
            process.env.ENABLE_LOGGING === '1'
              ? {
                  path: process.cwd() + '/artifacts/testLogs/test-results.log',
                  omitContent: true
                }
              : undefined,
          ignoreHTTPSErrors: process.env.IGNORE_HTTPS_ERRORS === 'true'
        },
        collectCoverage: process.env.COLLECT_COVERAGE === 'true'
      }
    }
  };

  try {
    // We write the Jest configuration to a file instead of passing it as a command line
    // as there are a couple of differences between what can be accepted as command line
    // parameters and what can be accepted in configuration files.
    const jestConfigPath = path.resolve(integrationTestsPackagePath, 'jest.config.json');
    await writeJestConfigFile(jestConfigPath, jestConfig);

    console.log(`##[section]Running the Playwright Integration Tests asynchronously`);

    console.log(`\nBrowser: ${options.browser} \nHeadless: ${options.headless}`);
    //Clean artifacts folder
    const artifacts = process.cwd() + '/artifacts';
    if (existsSync(artifacts)) {
      emptyDirSync(artifacts);
    }
    const testNamePatterns = testNamePattern ? [testNamePattern] : [];
    // Run the Jest asynchronously
    const { results } = await runJestCLI(
      {
        $0: '',
        config: jestConfigPath,
        ...options,

        _: testNamePatterns
      },
      [integrationTestsPackagePath]
    );

    console.log(`##[section]Completed the Playwright Integration Tests asynchronously`);
  } catch (e) {
    console.error('Error: Exception occurred while running Playwright test cases: ', e.message);
    return undefined;
  }
}
