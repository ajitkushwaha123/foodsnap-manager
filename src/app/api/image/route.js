import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Image from "@/model/Image";

export const GET = async (req) => {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);

    const skip = (page - 1) * limit;

    const images = await Image.find({}).skip(skip).limit(limit).lean();

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
