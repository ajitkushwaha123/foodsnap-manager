import dbConnect from "@/lib/dbConnect";
import Image from "@/model/Image";
import { NextResponse } from "next/server";

export const PUT = async (req, { params }) => {
  try {
    await dbConnect();

    const { imageId } = await params;
    const { isThali } = await req.json();

    if (!imageId) {
      return NextResponse.json(
        { error: "Image ID is required." },
        { status: 400 }
      );
    }

    if (typeof isThali === "undefined") {
      return NextResponse.json(
        { error: "isThali is required." },
        { status: 400 }
      );
    }

    const updatedImage = await Image.findByIdAndUpdate(
      imageId,
      { isThali },
      { new: true }
    );

    if (!updatedImage) {
      return NextResponse.json({ error: "Image not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updatedImage,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: err?.message || "Failed to update image.",
      },
      { status: 500 }
    );
  }
};
