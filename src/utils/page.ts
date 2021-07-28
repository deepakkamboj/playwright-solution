import { $, getDefaultPage, Page, PageElementHandle } from '.';

export class HomePage {
  static async openPage(page: Page = getDefaultPage(), url: string): Promise<HomePage> {
    await page.goto(url);
    return new HomePage(page);
  }

  constructor(public page: Page) {}
}
