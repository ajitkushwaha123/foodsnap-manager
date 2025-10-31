import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Image from "@/model/Image";

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
  try {
    await dbConnect();

    const body = await req.json();
    const { image_url, title, category, sub_category, food_type, description } =
      body;

    if (!image_url || !title || !category || !food_type) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: image_url, title, category, food_type",
        },
        { status: 400 }
      );
    }

    const newImage = new Image({
      title: title || "-",
      auto_tags: [],
      cuisine: "",
      quality_score: 10,
      description: description || "",
      category: category || "",
      sub_category: sub_category || "",
      food_type: normalizeFoodType(food_type, food_type || "veg"),
      image_url,
      approved: false,
      system_approved: true,
      premium: true,
      popularity_score: 0,
      likes: 0,
      source: "zomato_api",
    });

    await newImage.save();

    console.log("✅ Image saved to database:", newImage._id);

    return NextResponse.json(
      { success: true, image: newImage },
      { status: 201 }
    );
  } catch (error) {
    console.error("[IMAGE_UPLOAD_ERROR]", error);
    return NextResponse.json(
      { error: "An error occurred while uploading the image." },
      { status: 500 }
    );
  }
};
