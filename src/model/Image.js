import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    manual_tags: [{ type: String, trim: true }],
    auto_tags: [{ type: String, trim: true }],
    cuisine: { type: String, trim: true },
    image_url: { type: String, required: true, trim: true },
    approved: { type: Boolean, default: false },
    system_approved: { type: Boolean, default: false },
    premium: { type: Boolean, default: false },
    quality_score: { type: Number, default: 10, min: 0, max: 10 },
    popularity_score: { type: Number, default: 0, min: 0 },
    likes: { type: Number, default: 0, min: 0 },
    category: { type: String, trim: true },
    sub_category: { type: String, trim: true },
    food_type: { type: String, trim: true },
    downloads: { type: Number, default: 0, min: 0 },
    source: { type: String, trim: true },
  },
  { timestamps: true }
);

ImageSchema.index(
  {
    title: "text",
    manual_tags: "text",
    auto_tags: "text",
    cuisine: "text",
    description: "text",
  },
  {
    weights: {
      title: 10,
      manual_tags: 6,
      auto_tags: 6,
      cuisine: 3,
      description: 1,
    },
    name: "TextSearchIndex",
  }
);

ImageSchema.index(
  { category: 1 },
  { collation: { locale: "en", strength: 2 } }
);
ImageSchema.index(
  { sub_category: 1 },
  { collation: { locale: "en", strength: 2 } }
);

ImageSchema.index({ approved: 1, premium: 1, system_approved: 1 });

const Image = mongoose.models.Image || mongoose.model("Image", ImageSchema);

export default Image;
