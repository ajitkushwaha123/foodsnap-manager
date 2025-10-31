import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const STORAGE_PATH = path.resolve("./zomato-session.json");

// Toggle headless via env variable
const HEADLESS = process.env.HEADLESS !== "false"; // default true

export async function getBrowser() {
  let browser;
  let context;

  const hasSession = fs.existsSync(STORAGE_PATH);

  browser = await chromium.launch({
    headless: HEADLESS,
    args: [
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
      "--disable-http2", // optional: disables HTTP/2 to avoid protocol errors
    ],
  });

  context = await browser.newContext({
    storageState: hasSession ? STORAGE_PATH : undefined,
    viewport: { width: 1366, height: 768 },
    locale: "en-US",
    timezoneId: "Asia/Kolkata",
    colorScheme: "light",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
  });

  // Extra headers to reduce detection
  await context.setExtraHTTPHeaders({
    "Accept-Language": "en-US,en;q=0.9",
  });

  // Anti-detection script
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
  });

  console.log(
    hasSession ? "✅ Session loaded" : "⚠️ No session found, login needed"
  );

  return { browser, context };
}

export async function closeBrowser(browser) {
  if (browser) {
    await browser.close();
    console.log("🛑 Browser closed");
  }
}
