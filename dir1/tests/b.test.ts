import { logInfo, Page, getDefaultPage, HomePage } from "./utils";
describe("Playwright Integration Tests", () => {

  let homePage: HomePage;
  test("Open W3Schools", async () => {

    logInfo("Navigating to Page.");

    homePage = await HomePage.openPage(
      getDefaultPage(), "https://www.w3schools.com/"
      );

    //navigate to a website
    
    logInfo("Generating screenshot.");
   
   logInfo("Closing Page.");
  
  });
 
});


