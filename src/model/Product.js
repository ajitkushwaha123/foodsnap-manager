import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    description: { type: String, default: "" },
    img: { type: String, default: "" },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    sub_category: { type: mongoose.Schema.Types.ObjectId, ref: "SubCategory" },
    food_type: { type: String, default: "temp" },
    variants: { type: Array, default: [] },
    item_type: { type: String, default: "Goods" },
    base_price: { type: Number, required: true, min: 0 },
    userId: { type: String, required: true },
    projectId: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "done"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
