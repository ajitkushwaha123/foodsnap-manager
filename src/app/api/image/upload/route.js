import { addManualUploadedImageToQueue } from "@/lib/upload-service/job/addManualUploadedImageToQueue";
import { uploadToAws } from "@/lib/upload-service/uploadToAws";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export const POST = async (req) => {
  try {
    const formData = await req.formData();
    const file = formData.get("images");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    console.log("Received file:", file.name);

    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType = file.type || "image/jpeg";

    const uploaded = await uploadToAws(buffer, file.name, contentType)

    await addManualUploadedImageToQueue(uploaded);

    return NextResponse.json(
      {
        message: "Image uploaded successfully",
        data: uploaded,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("S3 Upload Error:", err);
    return NextResponse.json(
      { error: "Error uploading image", details: err.message },
      { status: 500 }
    );
  }
};
