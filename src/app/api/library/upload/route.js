import { NextResponse } from "next/server";
import { addProductToQueue } from "@/lib/upload-service/job/addProductToQueue";
import dbConnect from "@/lib/dbConnect";
import Product from "@/model/Product";
import axios from "axios";
import sharp from "sharp";

const MIN_WIDTH = 300;
const MIN_HEIGHT = 300;
const MAX_WIDTH = 1800;
const MAX_HEIGHT = 1200;

/**
 * Updates product status and appends a log entry.
 */
const updateStatus = async (productId, status, reason = "") => {
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

/**
 * Validates and transforms the image URL if it’s outside allowed dimensions.
 */
const getTransformedImageUrl = async (imageUrl) => {
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

    // Apply resize/crop transformation using the provider’s image params
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

/**
 * API Route — Queues multiple products for upload.
 */
export const POST = async (req) => {
  try {
    await dbConnect();
    const { data } = await req.json();

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { success: false, error: "No product data provided" },
        { status: 400 }
      );
    }

    console.log(`📥 Received ${data.length} product(s) for upload`);

    const results = [];

    for (const product of data) {
      if (!product?._id) {
        results.push({
          _id: null,
          status: "failed",
          reason: "Missing product ID",
        });
        continue;
      }

      try {
        await updateStatus(
          product._id,
          "uploading",
          "Checking image dimensions"
        );

        const imageUrl = await getTransformedImageUrl(product.img);

        if (!imageUrl) {
          await updateStatus(
            product._id,
            "failed",
            "Invalid or missing image URL"
          );
          results.push({ _id: product._id, status: "failed" });
          continue;
        }

        // Add product to BullMQ queue
        await addProductToQueue({
          title: product.name,
          category: product.category,
          sub_category: product.sub_category,
          food_type: product.food_type,
          description: product.description,
          image_url: imageUrl,
          productId: product._id,
          userId: product.userId,
          projectId: product.projectId,
        });

        await updateStatus(
          product._id,
          "queued",
          "Product added to upload queue"
        );

        results.push({ _id: product._id, status: "queued" });
      } catch (err) {
        console.error(
          `❌ Failed to enqueue product ${product._id}:`,
          err.message
        );

        await updateStatus(
          product._id,
          "failed",
          err.message || "Unexpected error during queueing"
        );

        results.push({
          _id: product._id,
          status: "failed",
          reason: err.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `${results.length} product(s) processed`,
      results,
    });
  } catch (error) {
    console.error("[QUEUE_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "An error occurred while queuing products." },
      { status: 500 }
    );
  }
};
