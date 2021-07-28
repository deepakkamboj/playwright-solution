/**
 * @license Copyright (c) Microsoft Corporation. All rights reserved.
 */

/* eslint-disable security/detect-non-literal-fs-filename */
/* eslint-disable no-console */
const JestPlaywrightEnvironment = require('jest-playwright-preset/lib/PlaywrightEnvironment').default;
const fs = require('fs');
const path = require('path');

class PlaywrightEnvironment extends JestPlaywrightEnvironment {
  constructor(config, context) {
    super(config, context);
   // console.log("Config: ", config);
    //console.log("Context: ", context);
    this.testContext = {};
  }

  async setup() {
    console.log('##[section]Setup Playwright Test Environment.');
    await super.setup();
  }

  async teardown() {
    console.log('##[section]Teardown Playwright Test Environment.');
    await super.teardown();
  }

  async handleTestEvent(event) {
    switch (event.name) {
      case 'test_fn_failure':
        this.testContext.testFailed = true;
        this.logError(
          `Error: Test (${event.test.name}) failed on run #: ${
            event.test.invocations
          } after running for ${Math.floor(
            (new Date().getTime() - this.testContext.testStart) / 1000
          )} seconds`
        );
        if (event.test.errors) {
          event.test.errors.forEach(error => {
            // The error object is a two element array. The first element seems to be either a string or simple object.
            this.logError(`\tError: ${JSON.stringify(error[0])}`);
          });
        }
        break;

      case 'test_retry':
        this.logInfo(`Retry #: ${event.test.invocations}`);
        this.testContext.testInvocations = event.test.invocations;
        break;

      case 'test_start':
        this.testContext.testName = event.test.name;
        this.testContext.testSuiteName = event.test.parent.name;
        this.testContext.testInvocations = event.test.invocations;
        this.testContext.testFailed = false;
        this.testContext.testStart = new Date().getTime();
        this.logInfo(`Running Test: ${event.test.name}`);
        break;

      case 'test_done':
        if (event.test.errors.length > 0) {
          await this.generateScreenshot(event);
        }
        this.logInfo(
          `Test Completed: ${event.test.name}\n***************************************************\n`
        );
        break;

      case 'run_start':
        this.logInfo(`Test Run - STARTED`);
        break;

      case 'run_finish':
        this.logInfo(`Test Run - COMPLETED`);
        break;
    }
  }

  async generateScreenshot(event) {
    try {
      const testName = this.testContext.testName;
      const testInvocations = this.testContext.testInvocations;
      const screenshotFolder = path.join(process.cwd(), 'artifacts', 'screenshots');
      //fs.mkdirSync(screenshotFolder, { recursive: true });
      const screenshotPath = `${screenshotFolder}/${this.formatFilename(
        `${testName}-try-${testInvocations}`
      )}.png`;
      this.logInfo('See screenshot context: ' + screenshotPath.toLowerCase());
      await this.global.page.screenshot({ path: screenshotPath });

      // Run only for build pipeline
      if (process.env['BUILD_BUILDNUMBER'] !== undefined) {
        this.logInfo('Attaching screenshot to Build Pipline Summary.');
      }
    } catch (e) {
      console.error('Exception generating screenshot: {0}', e.message);
    }
  }

  get testContext() {
    return this.global.__TEST_CONTEXT__;
  }

  set testContext(value) {
    this.global.__TEST_CONTEXT__ = {
      ...this.global.__TEST_CONTEXT__,
      ...value
    };
  }

  formatFilename(fileName) {
    return fileName.replace(/[^a-z0-9.-]+/gi, '_').toLowerCase();
  }

  logInfo(message) {
    this.logToFile(message);
    console.log('##[command]' + message);
  }

  logError(message) {
    this.logToFile(message);
    console.error('##[error]' + message);
  }

  logToFile(message) {
    const consoleOutFilename = 'consoleOut.log';
    const logFile = path.join(process.cwd(), 'artifacts', 'testLogs', consoleOutFilename);

    fs.mkdirSync(path.join(process.cwd(), 'artifacts', 'testLogs'), { recursive: true });

    const date = new Date();
    const dateTimeString = date.toUTCString(); // Wed, 14 Jun 2017 07:00:00 GMT

    fs.appendFileSync(logFile, '\n' + dateTimeString + '\t' + message);
  }
}

module.exports = PlaywrightEnvironment;
