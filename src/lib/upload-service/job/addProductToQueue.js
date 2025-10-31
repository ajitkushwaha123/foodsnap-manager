import { productQueue } from "../queue/productQueue";

export const addProductToQueue = async (productData) => {
  try {
    await productQueue.add("add-product", productData, {
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
