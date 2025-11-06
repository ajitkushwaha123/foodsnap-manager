import { Worker } from "bullmq";
import Redis from "ioredis";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.REDIS_URL) {
  throw new Error("Missing REDIS_URL in .env file");
}
if (!process.env.NEXT_PUBLIC_BASE_URL) {
  throw new Error("Missing NEXT_PUBLIC_BASE_URL in .env file");
}

const connection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "uploadedImageQueue",
  async (job) => {
    console.log(`[Job ${job.id}] 🚀 Processing product ${job.data.url}`);

    const { url } = job.data;

    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/image/upload/analyze`,
        {
          url,
        }
      );

      console.log(`[Job ${job.id}] ✅ Verification complete: ${data.message}`);
      return data;
    } catch (err) {
      console.error(`[Job ${job.id}] ❌ Verification failed:`, err.message);
      throw err;
    }
  },
  {
    connection,
    concurrency: 1,
    limiter: {
      max: 1,
      duration: 15000,
    },
  }
);

console.log(
  "🚀 Worker started and listening for jobs in 'uploadedImageQueue' queue"
);

// Event logs
worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed: ${err.message}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Closing worker...");
  worker.close().then(() => process.exit(0));
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Closing worker...");
  worker.close().then(() => process.exit(0));
});

export default worker;
