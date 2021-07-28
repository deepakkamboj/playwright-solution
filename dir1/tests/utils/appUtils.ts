import { ElementHandle, Page } from "playwright";

export enum EnvironmentVariable {
  AUTO_OPEN_DEVTOOLS = "AUTO_OPEN_DEVTOOLS",
  BASE_URL = "BASE_URL",
  BROWSER = "BROWSER",
  COLLECT_COVERAGE = "COLLECT_COVERAGE",
  ENABLE_LOGGING = "ENABLE_LOGGING",
  HEADLESS = "HEADLESS",
  IGNORE_FLAKY_TESTS = "IGNORE_FLAKY_TESTS",
  IGNORE_HTTPS_ERRORS = "IGNORE_HTTPS_ERRORS",
  INT_TESTS = "INT_TESTS",
  RECORD_VIDEO = "RECORD_VIDEO",
  RUN_ENV = "RUN_ENV",
  RUN_TYPE = "RUN_TYPE",
  TRACE_DEBUG_ENABLED = "TRACE_DEBUG_ENABLED",
  SLOW_DOWN_MS = "SLOW_DOWN_MS",
  USE_PASSWORDS_FROM_ENVIRONMENT = "USE_PASSWORDS_FROM_ENVIRONMENT",
}

export type PageElementHandle = ElementHandle<SVGElement | HTMLElement>;

export const enum LoadState {
  DomContentLoaded = "domcontentloaded",
  Load = "load",
  NetworkIdle = "networkidle",
}

function getEnvironmentVariable<U extends string | number>(
  envVar: EnvironmentVariable,
  converter?: (arg: string) => U
): U {
  const envName = EnvironmentVariable[EnvironmentVariable[envVar]];
  const envValue = process.env[envName];
  return converter ? converter(envValue || "") : (envValue as U);
}

function isTraceDebugEnabled(): boolean {
  return (
    getEnvironmentVariable(EnvironmentVariable.TRACE_DEBUG_ENABLED, (str) =>
      str ? Number(str) : 0
    ) === 1
  );
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
 * Navigate to the URL.
 * Navigating to the URL and waiting until 'load' event is fired in-between max 1 minute.
 * @param page Page reference.
 * @param navigationUrl Navigation URL.
 */
export async function navigateToUrl(
  page: Page,
  navigationUrl: string
): Promise<void> {
  // Navigate to the required URL.
  const loadState = LoadState.Load;

  const openInternal = async (retryCount = 0): Promise<any> => {
    /*eslint eslint-comments/no-unlimited-disable: off */
    /* eslint-disable */
    try {
      // Note that Promise.all prevents a race condition
      await Promise.all([
        page.waitForNavigation(),
        page.goto(navigationUrl, { waitUntil: loadState, timeout: 0 }),
      ]);
    } catch (e) {
      if (retryCount < 3) {
        const waitTime = 5000 * (retryCount + 1);
        console.log("Error occurred while navigating to URL: " + e.message);
        console.log(
          `Failed to navigate to URL ${navigationUrl}, waiting ${waitTime}ms and retrying. Retry # ${
            retryCount + 1
          }`
        );
        await page.waitForTimeout(waitTime);
        return openInternal(retryCount + 1);
      }
    }
    /* eslint-enable */
  };
  await openInternal();
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
  const data: Array<any> = await page.evaluate((e: any) => {
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
