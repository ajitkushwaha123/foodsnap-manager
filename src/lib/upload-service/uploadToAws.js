import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import dotenv from "dotenv";

dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function uploadToS3(imageUrl) {
  if (!imageUrl) throw new Error("No URL provided");

  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  imageUrl = imageUrl.split("?")[0];

  const contentType = response.headers.get("content-type") || "image/jpeg";
  const ext = contentType.split("/")[1] || "jpg";
  const buffer = Buffer.from(await response.arrayBuffer());

  const fileName = `${randomUUID()}.${ext}`;

  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: `images/${fileName}`,
    Body: buffer,
    ContentType: contentType,
  };

  await s3.send(new PutObjectCommand(uploadParams));

  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/images/${fileName}`;
}
