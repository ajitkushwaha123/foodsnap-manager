import { Queue } from "bullmq";
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const connection = new Redis(process.env.REDIS_URL);

export const uploadedImageQueue = new Queue("uploadedImageQueue", {
  connection,
});
