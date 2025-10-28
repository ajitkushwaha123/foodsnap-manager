import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Category from "@/model/Category";
import SubCategory from "@/model/SubCategory";
import Product from "@/model/Product";

export const POST = async (req, { params }) => {
  try {
    await dbConnect();

    const { userId, projectId } = await params;

    if (!userId || !projectId) {
      return NextResponse.json(
        { error: "Missing userId or projectId" },
        { status: 400 }
      );
    }

    const { categories, products } = await req.json();

    if (!Array.isArray(categories) || categories.length === 0) {
      return NextResponse.json(
        { error: "No categories provided" },
        { status: 400 }
      );
    }

    const categoryNames = [
      ...new Set(categories.map((c) => c?.name?.trim()).filter(Boolean)),
    ];

    await Category.bulkWrite(
      categoryNames.map((name) => ({
        updateOne: {
          filter: { name, userId, projectId },
          update: { $setOnInsert: { name, userId, projectId } },
          upsert: true,
        },
      })),
      { ordered: false }
    );

    const allCategories = await Category.find({
      name: { $in: categoryNames },
      userId,
      projectId,
    });

    const subOps = [];

    for (const cat of categories) {
      const categoryDoc = allCategories.find((c) => c.name === cat.name);
      if (!categoryDoc || !Array.isArray(cat.sub_categories)) continue;

      for (const subName of cat.sub_categories) {
        const name = subName?.trim();
        if (!name) continue;

        subOps.push({
          updateOne: {
            filter: {
              name,
              category: categoryDoc._id,
              userId,
              projectId,
            },
            update: {
              $setOnInsert: {
                name,
                category: categoryDoc._id,
                userId,
                projectId,
              },
            },
            upsert: true,
          },
        });
      }
    }

    if (subOps.length > 0) {
      await SubCategory.bulkWrite(subOps, { ordered: false });
    }

    const subCategories = await SubCategory.find({
      userId,
      projectId,
    }).select("_id name category");

    const groupedSubs = subCategories.reduce((acc, sub) => {
      acc[sub.category] = acc[sub.category] || [];
      acc[sub.category].push(sub._id);
      return acc;
    }, {});

    const catUpdateOps = Object.entries(groupedSubs).map(([catId, subIds]) => ({
      updateOne: {
        filter: { _id: catId },
        update: { $set: { subcategories: subIds } },
      },
    }));

    if (catUpdateOps.length > 0) {
      await Category.bulkWrite(catUpdateOps, { ordered: false });
    }

    if (Array.isArray(products) && products.length > 0) {
      // Create lookup maps
      const categoryMap = {};
      const subCategoryMap = {};

      const allCats = await Category.find({ userId, projectId }).lean();
      const allSubs = await SubCategory.find({ userId, projectId }).lean();

      allCats.forEach((cat) => {
        categoryMap[cat.name.toLowerCase()] = cat._id;
      });

      allSubs.forEach((sub) => {
        subCategoryMap[`${sub.name.toLowerCase()}_${sub.category.toString()}`] =
          sub._id;
      });

      const productOps = products
        .map((prod) => {
          const categoryName = prod.category?.trim()?.toLowerCase();
          const categoryId = categoryMap[categoryName];

          if (!categoryId) {
            console.warn(
              `⚠️ Skipping product "${prod.name}" – category not found`
            );
            return null;
          }

          const subKey = `${prod.sub_category
            ?.trim()
            ?.toLowerCase()}_${categoryId}`;
          const subId = subCategoryMap[subKey] || null;

          return {
            updateOne: {
              filter: {
                name: prod.name,
                category: categoryId,
                userId,
                projectId,
              },
              update: {
                $setOnInsert: {
                  id: prod.id,
                  name: prod.name,
                  description: prod.description || "",
                  img: prod.img || "",
                  category: categoryId,
                  sub_category: subId,
                  food_type: prod.food_type || "temp",
                  variants: prod.variants || [],
                  item_type: prod.item_type || "Goods",
                  base_price: prod.base_price || 0,
                  userId,
                  projectId,
                },
              },
              upsert: true,
            },
          };
        })
        .filter(Boolean);

      if (productOps.length > 0) {
        await Product.bulkWrite(productOps, { ordered: false });
      }
    }

    return NextResponse.json(
      {
        message: "Categories, subcategories, and products saved successfully",
        categoriesProcessed: categoryNames.length,
        subCategoriesProcessed: subOps.length,
        productsProcessed: products?.length || 0,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Error saving data:", err);
    return NextResponse.json(
      { error: "Failed to save categories, subcategories, or products" },
      { status: 500 }
    );
  }
};
