import { chromium } from "playwright";
import path from "path";

const STORAGE_PATH = path.resolve("./zomato-session.json");

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // 1. Go to login page
  await page.goto("https://www.zomato.com/partners");

  // 2. Click login & manually authenticate (OTP/email)
  console.log("👉 Please log in manually...");

  // Wait for you to complete login
  await page.waitForTimeout(60000); // wait 60 sec manually

  // 3. Save cookies + localStorage
  await page.context().storageState({ path: STORAGE_PATH });

  console.log(`✅ Zomato session saved to ${STORAGE_PATH}`);
  await browser.close();
})();
