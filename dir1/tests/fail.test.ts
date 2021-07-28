import { Page } from "playwright";
import { navigateToUrl } from "./utils/appUtils";

jest.retryTimes(3);
describe("Test Suite # 3", () => {
  let page: Page;

  beforeAll(async () => {
    const getDefaultPage = (): Page => (global as any).page;
    page = getDefaultPage();
  });

  afterAll(async () => {
    if (page) {
      await page.close();
    }
  });

  test("Open Yahoo", async () => {
    //navigate to a website
    await navigateToUrl(page, "https://www.yahoo.com");

    await page.waitForLoadState("networkidle"); // This resolves after 'networkidle'

    await page.screenshot({
      path: `./screenshots/yahoo-${Date.now().toString()}.png`,
    });

    await page.click("[data-id='account']");

    //fail('it should not reach here');
  });
});
