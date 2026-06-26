import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Image from "@/model/Image";

export const DELETE = async (req) => {
  try {
    await dbConnect();

    const body = await req.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "No image IDs provided." },
        { status: 400 }
      );
    }

    const result = await Image.deleteMany({ _id: { $in: ids } });

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error("Image delete route error:", err);
    return NextResponse.json(
      { error: "Failed to delete images." },
      { status: 500 }
    );
  }
};

export const GET = async (req) => {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);

    const skip = (page - 1) * limit;

    const sort = searchParams.get("sort") || "none";
    const sortQuery = sort === "title" ? { title: 1 } : {};

    const images = await Image.find({}).sort(sortQuery).skip(skip).limit(limit).lean();

    const totalCount = await Image.countDocuments();

    return NextResponse.json({
      success: true,
      data: images,
      pagination: {
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        limit,
      },
    });
  } catch (err) {
    console.error("Image route error:", err);
    return NextResponse.json(
      { error: "Failed to fetch images." },
      { status: 500 }
    );
  }
};
