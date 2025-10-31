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

export const PUT = async (request, { params }) => {
  try {
    const { userId, projectId, productId } = await params;
    const { status } = await request.json();
    if (!userId || !projectId || !productId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    await dbConnect();
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: productId, userId, projectId },
      { status },
      { new: true }
    );

    if (!updatedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Product updated successfully", updatedProduct },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        error: "Failed to update product",
        details: err.message,
      },
      { status: 500 }
    );
  }
};
