import { uploadedImageQueue } from "../queue/uploadedImageQueue";

export const addManualUploadedImageToQueue = async (imageData) => {
  try {
    await uploadedImageQueue.add("uploadedImageQueue", imageData, {
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
