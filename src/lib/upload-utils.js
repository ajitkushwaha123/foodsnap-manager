import axios from "axios";
import sharp from "sharp";
import Product from "@/model/Product";

const MIN_WIDTH = 300;
const MIN_HEIGHT = 300;
const MAX_WIDTH = 1800;
const MAX_HEIGHT = 1200;

export const updateStatus = async (productId, status, reason = "") => {
  if (!productId) return;

  try {
    await Product.findByIdAndUpdate(
      productId,
      {
        $set: { status, reason },
        $push: {
          status_logs: {
            status,
            reason,
            timestamp: new Date(),
          },
        },
      },
      { new: true }
    );
  } catch (err) {
    console.error(`⚠️ Failed to update status for ${productId}:`, err.message);
  }
};

export const getTransformedImageUrl = async (imageUrl) => {
  try {
    if (!imageUrl) return null;

    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data);
    const { width, height } = await sharp(buffer).metadata();

    console.log(`📏 Image size: ${width}x${height}`);

    if (
      width >= MIN_WIDTH &&
      height >= MIN_HEIGHT &&
      width <= MAX_WIDTH &&
      height <= MAX_HEIGHT
    ) {
      console.log("✅ Image within valid range — using original URL");
      return imageUrl;
    }

    const transformedUrl = `${imageUrl}?fit=around|${MAX_WIDTH}:${MAX_HEIGHT}&crop=${MAX_WIDTH}:${MAX_HEIGHT}`;
    console.log(
      `⚙️ Image out of range — using transformed URL: ${transformedUrl}`
    );
    return transformedUrl;
  } catch (err) {
    console.error("❌ Error checking image dimensions:", err.message);
    return imageUrl;
  }
};
