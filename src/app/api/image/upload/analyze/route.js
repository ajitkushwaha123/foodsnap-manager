import { NextResponse } from "next/server";
import { analyzeImageWithGemini } from "@/lib/gemini";
import { addProductToQueue } from "@/lib/upload-service/job/addProductToQueue";
import Product from "@/model/Product";
import Category from "@/model/Category";
import SubCategory from "@/model/SubCategory";
import { getTransformedImageUrl } from "@/app/api/library/upload/route";
import dbConnect from "@/lib/dbConnect";

export const runtime = "nodejs";

export const POST = async (req) => {
  try {
    const { url: imageUrl } = await req.json();
    await dbConnect();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "No image URL provided" },
        { status: 400 }
      );
    }

    const userId = "user_34hnWbjrhdjbuZg7Lyr0o6WwmR0";
    const projectId = "690c7f1ac5c2656b98f8577f";

    const transformedImageUrl = await getTransformedImageUrl(imageUrl);

    const analyzedData = await analyzeImageWithGemini({
      image_url: transformedImageUrl,
      userId,
      projectId,
    });

    console.log("🧾 Analyzed Data:", analyzedData);

    if (!analyzedData || analyzedData.status === "analysis_failed") {
      return NextResponse.json(
        { error: "Gemini analysis failed", details: analyzedData?.reason },
        { status: 500 }
      );
    }

    const categoryName = analyzedData.category?.trim() || "Uncategorized";
    const category = await Category.findOneAndUpdate(
      { name: categoryName, userId, projectId },
      { $set: { name: categoryName, userId, projectId } },
      { upsert: true, new: true }
    );

    let subCategory = null;
    if (analyzedData.sub_category) {
      const subCategoryName = analyzedData.sub_category.trim();
      subCategory = await SubCategory.findOneAndUpdate(
        {
          name: subCategoryName,
          category: category._id,
          userId,
          projectId,
        },
        {
          $set: {
            name: subCategoryName,
            category: category._id,
            userId,
            projectId,
          },
        },
        { upsert: true, new: true }
      );

      if (!category.subcategories.includes(subCategory._id)) {
        category.subcategories.push(subCategory._id);
        await category.save();
      }
    }

    const product = await new Product({
      name: analyzedData.title || analyzedData.name || "Untitled",
      description: analyzedData.description || "",
      img: transformedImageUrl,
      category: category._id,
      sub_category: subCategory?._id || null,
      food_type: analyzedData.food_type || "veg",
      variants: [],
      item_type: "Goods",
      base_price: 0,
      userId,
      projectId,
      status: "queued",
      reason: "Added to processing queue",
      status_logs: [
        {
          status: "queued",
          reason: "Added to processing queue",
          timestamp: new Date(),
        },
      ],
    }).save();

    await addProductToQueue({
      title: product.name,
      category: category._id,
      sub_category: subCategory?._id,
      food_type: product.food_type,
      description: product.description,
      image_url: transformedImageUrl,
      productId: product._id,
      userId,
      projectId,
    });

    return NextResponse.json(
      {
        message: "✅ Product created, categorized, and queued successfully",
        data: {
          product,
          category,
          subCategory,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Upload/Analysis Error:", err);

    return NextResponse.json(
      {
        error: "Error processing image",
        details: err.message,
      },
      { status: 500 }
    );
  }
};
