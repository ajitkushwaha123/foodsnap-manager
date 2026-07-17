import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ Missing MONGODB_URI in .env file");
  process.exit(1);
}

const ImageSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const Image = mongoose.models.Image || mongoose.model("Image", ImageSchema);

async function fix() {
  console.log("🔌 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected!");

  // Count images wrongly marked: latest=false but premium=true
  const wrongFilter = { latest: { $ne: true }, premium: true };
  const wrongCount = await Image.countDocuments(wrongFilter);
  console.log(`🔍 Found ${wrongCount} image(s) with latest≠true but premium=true (incorrectly set)`);

  if (wrongCount > 0) {
    const fixResult = await Image.updateMany(wrongFilter, { $set: { premium: false } });
    console.log(`🔧 Fixed ${fixResult.modifiedCount} image(s) → premium: false`);
  }

  // Also ensure all latest=true images are premium=true
  const latestFilter = { latest: true, premium: { $ne: true } };
  const latestCount = await Image.countDocuments(latestFilter);
  console.log(`🔍 Found ${latestCount} image(s) with latest=true but premium≠true`);

  if (latestCount > 0) {
    const latestResult = await Image.updateMany(latestFilter, { $set: { premium: true } });
    console.log(`✅ Updated ${latestResult.modifiedCount} image(s) → premium: true`);
  }

  await mongoose.disconnect();
  console.log("🔌 Disconnected. Done!");
}

fix().catch((err) => {
  console.error("❌ Script failed:", err);
  process.exit(1);
});
