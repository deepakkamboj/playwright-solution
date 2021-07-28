import { chromium } from "playwright";

jest.retryTimes(3);
describe("Test Suite # 3", ()=>{

    test("test case # 3", async()=>{
        // launch browser
        const browser = await chromium.launch();

        // create browser context
        const context = await browser.newContext();

        // open page
        const page = await context.newPage();

        //navigate to a website
        await page.goto('https://www.yahoo.com/');

        //fail('it should not reach here');

        throw new Error('I have failed you, Sorry');

        await page.close();
        await context.close();
        await browser.close();
    });

});