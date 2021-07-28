/**
 * @license Copyright (c) Microsoft Corporation. All rights reserved.
 */

import { ElementHandle, EnvironmentVariable, Page, RunType } from ".";
import { appendFileSync, existsSync, mkdirSync } from "fs-extra";
import { join } from "path";

/**
 * Gets the default browser automation page.
 */
export const getDefaultPage = (): Page => (global as any).page; // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * Explicit wait for required seconds.
 * @param seconds #Seconds need to be waited.
 */
export const sleep = (seconds: any) =>
  new Promise((resolve) => setTimeout(resolve, (seconds || 1) * 1000));

/**
 * Gets the default log file.
 */
const getLogger = (): string =>
  (global as any).__TEST_CONTEXT__.logFileFullPath; // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * Wraps playwright ElementHandle for SVG or HTML elements to abstract selector return types.
 */
export type PageElementHandle = ElementHandle<SVGElement | HTMLElement>;

function getEnvironmentVariable<U extends string | number>(
  envVar: EnvironmentVariable,
  converter?: (arg: string) => U
): U {
  const envName = EnvironmentVariable[EnvironmentVariable[envVar]];
  const envValue = process.env[envName];
  return converter ? converter(envValue || "") : (envValue as U);
}

/**
 * Returns true if it should be a headless run.
 */
export function isHeadlessRun(): boolean {
  return (
    getEnvironmentVariable(EnvironmentVariable.HEADLESS, (str) =>
      str ? Number(str) : 0
    ) === 1
  );
}

/**
 * Returns if video recording is enabled during test run.
 */
export function isVideoRecordingEnabled(): boolean {
  return (
    getEnvironmentVariable(EnvironmentVariable.RECORD_VIDEO, (str) =>
      str ? Number(str) : 0
    ) === 1
  );
}

/**
 * Returns if logging is enabled.
 */
export function isLoggingEnabled(): boolean {
  return (
    getEnvironmentVariable(EnvironmentVariable.ENABLE_LOGGING, (str) =>
      str ? Number(str) : 0
    ) === 1
  );
}

function isTraceDebugEnabled(): boolean {
  return (
    getEnvironmentVariable(EnvironmentVariable.TRACE_DEBUG_ENABLED, (str) =>
      str ? Number(str) : 0
    ) === 1
  );
}

// type predicate to narrow a string type to RunType union type.
function isRunType(str: string): str is RunType {
  return str === "pr" || str === "nightly" || str === "runner";
}

export function mkdirIfNotExist(dir: string) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

/**
 * Traces debug messages.
 * @param args the args
 */
export function traceDebug(...args: any[]): void {
  // eslint-disable-line @typescript-eslint/no-explicit-any
  if (isTraceDebugEnabled()) {
    console.log(...args); // eslint-disable-line no-console
  }
}

/**
 * Logs info
 * @param message
 * @returns info
 */
export async function logInfo(message: string): Promise<void> {
  const logger = getLogger();
  if (logger) {
    const logFile = join(process.cwd(), getLogger());
    appendFileSync(logFile, "\n" + getCurrentTime() + "\t" + message);
  } else {
    console.log('Log file was not created for these tests.');
  }
  console.log(message);
}

/**
 * Clicks on an element passed in and debug traces the click.
 * @param element The element handle -- it must have data-automation-id, class, or id attributes.
 */
export async function click(page: Page, element: ElementHandle): Promise<void> {
  const identifier = await getIdentifier(page, element);
  traceDebug(`Clicked: ${identifier}`);
  return element.click();
}

async function getIdentifier(
  page: Page,
  element: ElementHandle<Node>
): Promise<string> {
  const data: Array<any> = await page.evaluate((e) => {
    const el = e as HTMLElement;
    return [
      el.getAttribute("data-automation-id"),
      el.getAttribute("id"),
      el.getAttribute("class"),
    ];
  }, element);
  const attribute = data.find((s) => s);
  if (!attribute) {
    throw new Error(
      `Could not find data-automation-id, id, or class attribute on clicked element`
    );
  }
  return attribute;
}

/**
 * Gets an element handle under an element with a selector.
 * @param page The page
 * @param selector The selector
 * @param parent The parent or ancestor element
 */
export async function $(
  page: Page,
  selector: string,
  parent?: PageElementHandle
): Promise<PageElementHandle> {
  const waitObj = parent || page;
  const $el = await waitObj.waitForSelector(selector);
  if ($el) {
    const identifier = await getIdentifier(page, $el);
    traceDebug(`selected element ${identifier}`);
    return $el;
  }

  throw new Error(`failed to select element at ${selector}`);
}

/**
 * Gets the run type for the current test run.
 */
export function getCurrentRunType(): RunType {
  const str = getEnvironmentVariable<string>(EnvironmentVariable.RUN_TYPE);
  if (!str || !isRunType(str)) {
    throw new Error("RUN_TYPE env var is required.");
  }
  return str;
}

function getCurrentTime() {
  const date = new Date(); // had to remove the colon (:) after the T in order to make it work
  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();
  const minutes = date.getMinutes();
  const hours = date.getHours();
  const seconds = date.getSeconds();
  const myFormattedDate =
    pad(monthIndex + 1) +
    "-" +
    pad(day) +
    "-" +
    year +
    " " +
    pad(hours) +
    ":" +
    pad(minutes) +
    ":" +
    pad(seconds);

  return myFormattedDate;
}

function pad(n: number) {
  return (n < 10 ? "0" : "") + n;
}
