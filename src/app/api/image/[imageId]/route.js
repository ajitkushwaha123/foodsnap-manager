import dbConnect from "@/lib/dbConnect";
import Image from "@/model/Image";
import { NextResponse } from "next/server";

export const DELETE = async (req, { params }) => {
  try {
    await dbConnect();
    const { imageId } = await params;

    if (!imageId) {
      return NextResponse.json(
        { error: "Image ID is required." },
        { status: 400 }
      );
    }

    const deletedImage = await Image.findByIdAndDelete(imageId);

    if (!deletedImage) {
      return NextResponse.json({ error: "Image not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: deletedImage });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete image." },
      { status: 500 }
    );
  }
};

export const PUT = async (req, { params }) => {
  try {
    await dbConnect();
    const { imageId } = await params;
    const { status } = await req.json();
    if (!imageId) {
      return NextResponse.json(
        { error: "Image ID is required." },
        { status: 400 }
      );
    }

    const updatedImage = await Image.findByIdAndUpdate(
      imageId,
      { approved: status },
      { new: true }
    );

    if (!updatedImage) {
      return NextResponse.json({ error: "Image not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updatedImage });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update image." },
      { status: 500 }
    );
  }
};
