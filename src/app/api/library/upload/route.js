import { NextResponse } from "next/server";
import { addProductToQueue } from "@/lib/upload-service/job/addProductToQueue";
import dbConnect from "@/lib/dbConnect";

export const POST = async (req) => {
  try {
    await dbConnect();

    const {
      img: file,
      title,
      category,
      sub_category,
      food_type,
      description,
    } = await req.json();

    await addProductToQueue({
      title,
      category,
      sub_category,
      food_type,
      description,
      file,
    });

    return NextResponse.json({ success: true, message: "Job added to queue" });
  } catch (error) {
    console.error("[IMAGE_UPLOAD_ERROR]", error);
    return NextResponse.json(
      { error: "An error occurred while queuing the image upload." },
      { status: 500 }
    );
  }
};
