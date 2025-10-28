import dbConnect from "@/lib/dbConnect";
import Category from "@/model/Category";
import { NextResponse } from "next/server";

export const GET = async (req, { params }) => {
  try {
    const { userId, projectId } = await params;
    await dbConnect();

    const categories = await Category.find({ userId, projectId })
      .populate("subcategories", "_id name")
      .lean();

    const formatted = categories.map((cat) => ({
      _id: cat._id.toString(),
      name: cat.name,
      subcategories:
        cat.subcategories?.map((sub) => ({
          _id: sub._id.toString(),
          name: sub.name,
        })) || [],
    }));

    return NextResponse.json(
      { data: formatted, message: "Categories fetched successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch categories.", details: error.message },
      { status: 500 }
    );
  }
};
