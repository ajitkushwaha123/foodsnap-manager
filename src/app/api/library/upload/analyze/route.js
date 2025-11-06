import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Image from "@/model/Image";
import Product from "@/model/Product";

const normalizeFoodType = (ft, fallback = "veg") => {
  if (!ft) return fallback;
  const map = {
    veg: "veg",
    vegetarian: "veg",
    non_veg: "non_veg",
    "non-veg": "non_veg",
    nonveg: "non_veg",
    egg: "egg",
    eggetarian: "egg",
  };
  return map[ft.toLowerCase()] || fallback;
};

export const POST = async (req) => {
  await dbConnect();

  try {
    const body = await req.json();
    const {
      image_url,
      title,
      category,
      sub_category,
      food_type,
      description,
      productId,
    } = body;

    console.log("📦 Received upload request:", body);

    if (!image_url || !title || !category || !food_type || !productId) {
      const reason = "Missing required fields in upload request";
      console.warn(`⚠️ ${reason}`);

      await Product.findByIdAndUpdate(productId, {
        status: "rejected",
        reason,
      });

      return NextResponse.json(
        { success: false, error: reason },
        { status: 400 }
      );
    }

    console.log("🖼 Uploading image to database...", image_url);

    const newImage = await Image.create({
      title: title || "-",
      auto_tags: [],
      cuisine: "",
      quality_score: 10,
      description: description || "",
      category: category || "",
      sub_category: sub_category || "",
      food_type: normalizeFoodType(food_type, "veg"),
      image_url,
      approved: false,
      system_approved: true,
      premium: true,
      popularity_score: 0,
      likes: 0,
      source: "zomato_api",
    });

    console.log("✅ Image saved:", newImage._id.toString());

    await Product.findByIdAndUpdate(productId, {
      status: "done",
      reason: "Image successfully uploaded and saved",
    });

    console.log(`📦 Product ${productId} marked as done`);

    return NextResponse.json(
      { success: true, image: newImage },
      { status: 201 }
    );
  } catch (error) {
    console.error("[IMAGE_UPLOAD_ERROR]", error);

    const errorMessage =
      error.message || "An unexpected error occurred during upload";

    try {
      const body = await req.json().catch(() => ({}));
      if (body?.productId) {
        await Product.findByIdAndUpdate(body.productId, {
          status: "failed",
          reason: errorMessage,
        });
        console.log(`❌ Product ${body.productId} marked as failed`);
      }
    } catch {
      console.warn("⚠️ Could not update product status to failed");
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
};
