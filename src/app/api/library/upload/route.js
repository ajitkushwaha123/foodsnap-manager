import { NextResponse } from "next/server";
import { addProductToQueue } from "@/lib/upload-service/job/addProductToQueue";
import dbConnect from "@/lib/dbConnect";
import Product from "@/model/Product";

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
      productId,
    } = await req.json();

    const product = await Product.findById(productId);

    if (product) {
      product.status = "accepted";
      await product.save();
    }

    await addProductToQueue({
      title,
      category,
      sub_category,
      food_type,
      description,
      file,
      productId,
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
