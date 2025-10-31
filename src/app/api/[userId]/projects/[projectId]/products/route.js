import dbConnect from "@/lib/dbConnect";
import Category from "@/model/Category";
import Product from "@/model/Product";
import SubCategory from "@/model/SubCategory";
import { NextResponse } from "next/server";

export const GET = async (req, { params }) => {
  try {
    const { userId, projectId } = await params;
    const { searchParams } = new URL(req.url);

    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const limit = Math.max(parseInt(searchParams.get("limit") || "100", 10), 1);
    const skip = (page - 1) * limit;

    if (!userId || !projectId) {
      return NextResponse.json(
        { error: "Missing required parameters: 'userId' or 'projectId'" },
        { status: 400 }
      );
    }

    await dbConnect();

    console.log(
      "🔍 Fetching products for userId:",
      userId,
      "projectId:",
      projectId,
      "page:",
      page,
      "limit:",
      limit,
      "skip:",
      skip
    );

    const query = { userId, projectId };

    const totalCount = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate("category", "name")
      .populate("sub_category", "name")
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json(
      {
        data: products,
        pagination: {
          totalCount,
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          limit,
        },
        message: "✅ Products fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch products.",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
};

export const DELETE = async (req, { params }) => {
  try {
    const { userId, projectId } = await params;

    if (!userId || !projectId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    await dbConnect();

    const result = await Product.deleteMany({ userId, projectId });

    return NextResponse.json(
      {
        success: true,
        message: `${result.deletedCount} products deleted successfully.`,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Failed to delete all products:", err);
    return NextResponse.json(
      { error: "Failed to delete all products", details: err.message },
      { status: 500 }
    );
  }
};
