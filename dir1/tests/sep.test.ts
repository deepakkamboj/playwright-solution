import { chromium } from "playwright";

describe("Test Suite # 2", ()=>{

    test("test case # 2", async()=>{
        // launch browser
        const browser = await chromium.launch();

        // create browser context
        const context = await browser.newContext();

        // open page
        const page = await context.newPage();

        //navigate to a website
        await page.goto('https://www.w3schools.com/');

        await page.screenshot({ path: `./screenshots/example-${Date.now().toString()}.png` });

        await page.close();
        await context.close();
        await browser.close();
    });

});