import { zomatoProductImportQueue } from "../queue/zomatoProductImportQueue";

export const addScrapedProductFromZomatoToQueue = async (scrapedData) => {
  try {
    await zomatoProductImportQueue.add("zomato-product", scrapedData, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 3000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });
    console.log("✅ Product job added to queue");
  } catch (err) {
    console.error("❌ Failed to add job to queue", err);
    throw err;
  }
};
