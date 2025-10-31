// & "C:/Program Files/Google/Chrome/Application/chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:/Users/Aakash/zomato-session"
import express from "express";
import puppeteer from "puppeteer";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();

const zomatoRouter = express.Router();
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USER_DATA_DIR =
  process.env.PUPPETEER_USER_DATA_DIR || path.resolve("./puppeteer_profile");
const HEADLESS = true;

let browser = null;

zomatoRouter.post("/", async (req, res) => {
  const browser = await puppeteer.connect({
    browserURL: "http://127.0.0.1:9222",
    defaultViewport: null,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
    ],
  });

  const { data } = req.body;
  const resId = 21047451;
  console.log("Received data:", { items: data.length });

  try {
    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
    );
    await page.setExtraHTTPHeaders({
      "accept-language": "en-US,en;q=0.9",
    });

    await page.goto(
      `https://www.zomato.com/partners/onlineordering/menu/?resId=${resId}`,
      { waitUntil: "networkidle2" }
    );

    await delay(200);
    await page.waitForSelector('[data-tut="GO_TO_MENU_EDITOR"]', {
      visible: true,
    });
    await page.click('[data-tut="GO_TO_MENU_EDITOR"]');
    await delay(200);

    let uploadCount = 0;

    for (const item of data) {
      console.log("Processing item:", item);

      const {
        name,
        img: imageUrl,
        description,
        category,
        food_type,
        sub_category,
        _id: productId,
        userId,
        projectId,
      } = item;

      try {
        await page.waitForSelector('[data-tut="ADD_CATALOGUE"]', {
          visible: true,
        });
        await page.click('[data-tut="ADD_CATALOGUE"]');
        await delay(200);

        if (imageUrl) {
          await delay(3000);

          await page.evaluate(() => {
            const uploadBtn = document.evaluate(
              '//div[contains(text(), "Upload")]',
              document,
              null,
              XPathResult.FIRST_ORDERED_NODE_TYPE,
              null
            ).singleNodeValue;
            if (uploadBtn) uploadBtn.click();
          });

          await delay(200);

          // Click Continue
          await page.evaluate(() => {
            const continueBtn = document.evaluate(
              '//button[contains(text(), "Continue")]',
              document,
              null,
              XPathResult.FIRST_ORDERED_NODE_TYPE,
              null
            ).singleNodeValue;
            if (continueBtn) continueBtn.click();
          });

          const imagesDir = path.join(__dirname, "images");
          const localImagePath = path.join(imagesDir, "downloaded-image.jpg");
          if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir);

          const response = await axios.get(imageUrl, {
            responseType: "stream",
          });
          const writer = fs.createWriteStream(localImagePath);
          response.data.pipe(writer);
          await new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
          });

          const fileInput = await page.$("#image-input");
          if (fileInput) await fileInput.uploadFile(localImagePath);

          await delay(4000);

          // Try clicking "Map image"
          const clicked = await page.evaluate(() => {
            const btn = document.evaluate(
              '//button[contains(text(), "Map image")]',
              document,
              null,
              XPathResult.FIRST_ORDERED_NODE_TYPE,
              null
            ).singleNodeValue;
            if (btn && !btn.disabled) {
              btn.click();
              return true;
            }
            return false;
          });

          if (clicked) {
            // ✅ Image mapped successfully → call first API
            try {
              uploadCount++;
              await axios.post(
                `${process.env.FOODSNAP_MANAGER_URL}/api/library/upload`,
                {
                  img: imageUrl,
                  title: name,
                  description,
                  category: category?.name || "",
                  food_type,
                  sub_category: sub_category?.name || "",
                  productId,
                }
              );
              console.log(`[SUCCESS] Uploaded to library: ${name}`);
            } catch (apiErr) {
              console.error("API upload failed:", apiErr.message);
            }
          } else {
            // ❌ Image rejected → call second API
            try {
              await axios.put(
                `${process.env.FOODSNAP_MANAGER_URL}/api/${userId}/projects/${projectId}/products/${productId}`,
                { status: "rejected" }
              );
              console.log(`[REJECTED] Image rejected for: ${name}`);
            } catch (apiErr) {
              console.error("Reject API failed:", apiErr.message);
            }
          }
        } else {
          // ❌ No image at all → reject directly
          try {
            await axios.put(
              `${process.env.FOODSNAP_MANAGER_URL}/api/${userId}/projects/${projectId}/products/${productId}`,
              { status: "rejected" }
            );
            console.log(`[REJECTED] No image for: ${name}`);
          } catch (apiErr) {
            console.error("Reject API failed:", apiErr.message);
          }
        }

        await delay(200);

        // Always discard the item after processing
        await page.evaluate(() => {
          const discardBtn = document.evaluate(
            '//button[contains(text(), "Discard")]',
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
          ).singleNodeValue;
          if (discardBtn) discardBtn.click();
        });

        console.log(`Processed "${name}"`);
      } catch (err) {
        console.error(`Error processing item "${name}": ${err.message}`);
      }
    }

    await page.waitForSelector('[data-tut="SUBMIT_CHANGES"]', {
      visible: true,
    });
    await page.click('[data-tut="SUBMIT_CHANGES"]');

    await delay(300);

    res.status(200).send("Menu items uploaded successfully.");
  } catch (err) {
    console.error("Automation failed:", err);
    res.status(500).send(`Automation failed: ${err.message}`);
  }
});

export default zomatoRouter;
