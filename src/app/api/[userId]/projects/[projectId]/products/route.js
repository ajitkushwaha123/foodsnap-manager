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
    const limit = Math.max(parseInt(searchParams.get("limit") || "10", 10), 1);
    const skip = (page - 1) * limit;

    if (!userId || !projectId) {
      return NextResponse.json(
        { error: "Missing required parameters: 'userId' or 'projectId'" },
        { status: 400 }
      );
    }

    await dbConnect();

    const query = { userId, projectId };

    const [products, totalCount] = await Promise.all([
      Product.find(query)
        .populate("category", "name")
        .populate("sub_category", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

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
