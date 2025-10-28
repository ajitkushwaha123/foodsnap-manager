import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    imgUrl: { type: String },
    userId: {
      type: String,
      required: true,
    },
    projectId: {
      type: String,
      required: true,
    },
    subcategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubCategory",
      },
    ],
  },
  { timestamps: true }
);

categorySchema.index({ name: 1, userId: 1, projectId: 1 }, { unique: true });

const Category =
  mongoose.models.Category || mongoose.model("Category", categorySchema);

export default Category;
