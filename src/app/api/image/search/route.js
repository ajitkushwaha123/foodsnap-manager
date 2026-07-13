
import dbConnect from "@/lib/dbConnect";
import Image from "@/model/Image";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("q") || "").trim();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50000, Math.max(1, parseInt(searchParams.get("limit") || "1000", 10)));
    const food_type = (searchParams.get("food_type") || "").trim();
    const category = (searchParams.get("category") || "").trim();
    const approved = searchParams.get("approved");
    const latest = searchParams.get("latest");
    const skip = (page - 1) * limit;

    if (!query) {
      return NextResponse.json({
        success: true,
        data: [],
        query: "",
        page,
        limit,
        total: 0,
        hasMore: false,
        pagination: { totalCount: 0, currentPage: page, totalPages: 1, limit },
      });
    }

    const shouldClauses = [
      {
        text: {
          query,
          path: "title",
          score: { boost: { value: 10 } },
          fuzzy: { maxEdits: 1, prefixLength: 2 },
        },
      },
      {
        autocomplete: {
          query,
          path: "title",
          tokenOrder: "sequential",
          score: { boost: { value: 8 } },
        },
      },
      {
        text: {
          query,
          path: "manual_tags",
          score: { boost: { value: 6 } },
          fuzzy: { maxEdits: 1, prefixLength: 2 },
        },
      },
      {
        text: {
          query,
          path: "auto_tags",
          score: { boost: { value: 6 } },
          fuzzy: { maxEdits: 1, prefixLength: 2 },
        },
      },
      {
        text: {
          query,
          path: "cuisine",
          score: { boost: { value: 4 } },
          fuzzy: { maxEdits: 1 },
        },
      },
      {
        text: {
          query,
          path: ["category", "sub_category"],
          score: { boost: { value: 3 } },
        },
      },
      {
        text: {
          query,
          path: "description",
          score: { boost: { value: 1 } },
        },
      },
    ];

    const matchFilter = {};
    if (food_type) matchFilter.food_type = { $regex: `^${food_type}$`, $options: "i" };
    if (category) matchFilter.category = category;
    if (approved === "true") matchFilter.approved = true;
    else if (approved === "false") matchFilter.approved = false;
    if (latest === "true") matchFilter.latest = true;
    else if (latest === "false") matchFilter.latest = false;

    const hasFilters = Object.keys(matchFilter).length > 0;

    const pipeline = [
      {
        $search: {
          index: "food_atlas_search",
          compound: {
            should: shouldClauses,
            minimumShouldMatch: 1,
          },
        },
      },

      ...(hasFilters ? [{ $match: matchFilter }] : []),

      {
        $addFields: {
          _searchScore: { $meta: "searchScore" },
          _qualityBoost: {
            $multiply: [{ $ifNull: ["$quality_score", 0] }, 0.5],
          },
          _popularityBoost: {
            $min: [
              { $multiply: [{ $ifNull: ["$popularity_score", 0] }, 0.005] },
              0.5,
            ],
          },
        },
      },
      {
        $addFields: {
          _finalScore: {
            $add: ["$_searchScore", "$_qualityBoost", "$_popularityBoost"],
          },
        },
      },

      { $sort: { _finalScore: -1 } },

      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                title: 1,
                image_url: 1,
                food_type: 1,
                category: 1,
                sub_category: 1,
                cuisine: 1,
                quality_score: 1,
                approved: 1,
                premium: 1,
                isCombo: 1,
                isThali: 1,
                latest: 1,
                score: "$_finalScore",
              },
            },
          ],
        },
      },
    ];

    const [result] = await Image.aggregate(pipeline);

    const total = result?.metadata?.[0]?.total || 0;
    const data = result?.data || [];
    const totalPages = Math.ceil(total / limit) || 1;

    return NextResponse.json({
      success: true,
      data,
      query,
      page,
      limit,
      total,
      hasMore: skip + data.length < total,
      pagination: {
        totalCount: total,
        currentPage: page,
        totalPages,
        limit,
      },
    });
  } catch (err) {
    console.error("Search API Error:", err);
    return NextResponse.json(
      { success: false, message: "Search failed" },
      { status: 500 }
    );
  }
}
