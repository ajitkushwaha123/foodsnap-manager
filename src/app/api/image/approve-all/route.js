import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import Image from "@/model/Image";

export const PUT = async (req) => {
  try {
    await dbConnect();
    const { page = 1, limit = 100, all = false } = await req.json();

    let modifiedCount = 0;

    if (all) {
      const result = await Image.updateMany(
        { approved: { $ne: true } },
        { $set: { approved: true } }
      );
      modifiedCount = result.modifiedCount;
    } else {
      const skip = (page - 1) * limit;
      const ids = await Image.find({})
        .sort({ _id: 1 })
        .skip(skip)
        .limit(limit)
        .select("_id");

      if (ids.length > 0) {
        const result = await Image.updateMany(
          { _id: { $in: ids.map((i) => i._id) }, approved: { $ne: true } },
          { $set: { approved: true } }
        );
        modifiedCount = result.modifiedCount;
      }
    }

    return NextResponse.json(
      {
        message: all
          ? "All images approved successfully."
          : `Images approved successfully for page ${page}.`,
        count: modifiedCount,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Error approving images:", err);
    return NextResponse.json(
      { error: "Failed to approve all images." },
      { status: 500 }
    );
  }
};
