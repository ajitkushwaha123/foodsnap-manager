import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/model/Product";

export const DELETE = async (request, { params }) => {
  try {
    const { userId, projectId, productId } = await params;

    if (!userId || !projectId || !productId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    await dbConnect();

    const deletedProduct = await Product.findOneAndDelete({
      _id: productId,
      userId,
      projectId,
    });

    if (!deletedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Product deleted successfully", deletedProduct },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        error: "Failed to delete product",
        details: err.message,
      },
      { status: 500 }
    );
  }
};
