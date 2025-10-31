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
    const { page, limit, all } = await req.json();

    if (!userId || !projectId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }
    await dbConnect();

    const query = { userId, projectId };

    if (all) {
      const result = await Product.deleteMany(query);
      return NextResponse.json(
        {
          success: true,
          message: `All ${result.deletedCount} products deleted successfully.`,
        },
        { status: 200 }
      );
    }

    const skip = (page - 1) * limit;

    const productsToDelete = await Product.find(query)
      .sort({ _id: 1 })
      .skip(skip)
      .limit(limit)
      .select("_id");

    if (!productsToDelete.length) {
      return NextResponse.json(
        { message: "No products found for this page." },
        { status: 404 }
      );
    }

    const ids = productsToDelete.map((p) => p._id);
    const result = await Product.deleteMany({ _id: { $in: ids } });

    return NextResponse.json(
      {
        success: true,
        message: `${result.deletedCount} products deleted from page ${page}.`,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Failed to delete products:", err);
    return NextResponse.json(
      { error: "Failed to delete products", details: err.message },
      { status: 500 }
    );
  }
};
