import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Image from "@/model/Image";

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────
const MAX_RESULTS = 3;
const ATLAS_MIN_SCORE = 5.0; // minimum Atlas search score to accept a result

// Words that carry no discriminative meaning — stripped before word-overlap matching
const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "of", "in", "on", "with", "for",
  "to", "by", "at", "from", "is", "it", "its", "be", "as",
  "style", "type", "recipe", "dish", "food", "item", "special",
]);

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Escape special regex characters in a string. */
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Extract significant words from a title by lowercasing and removing stopwords.
 * Minimum word length: 2 chars.
 */
const significantWords = (title) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !STOPWORDS.has(w));

/** Shared projection — only return fields the caller needs. */
const PROJECT = {
  _id: 1,
  title: 1,
  image_url: 1,
  quality_score: 1,
  popularity_score: 1,
  food_type: 1,
  category: 1,
  sub_category: 1,
  premium: 1,
  latest: 1,
};

// ─────────────────────────────────────────────────────────────────────────────
// Tier 1 — Exact title match (case-insensitive)
// ─────────────────────────────────────────────────────────────────────────────
async function matchExact(title, food_type) {
  const filter = {
    title: { $regex: `^${escapeRegex(title)}$`, $options: "i" },
    premium: true,
  };
  if (food_type) filter.food_type = { $regex: `^${escapeRegex(food_type)}$`, $options: "i" };

  return Image.find(filter, PROJECT)
    .sort({ quality_score: -1, popularity_score: -1 })
    .limit(MAX_RESULTS)
    .lean();
}

// ─────────────────────────────────────────────────────────────────────────────
// Tier 2 — Word-overlap match (ALL significant words must appear in title)
// ─────────────────────────────────────────────────────────────────────────────
async function matchWordOverlap(title, category, food_type) {
  const words = significantWords(title);
  if (words.length === 0) return [];

  const wordConditions = words.map((w) => ({
    title: { $regex: escapeRegex(w), $options: "i" },
  }));

  const filter = {
    $and: wordConditions,
    premium: true,
  };
  if (food_type) filter.food_type = { $regex: `^${escapeRegex(food_type)}$`, $options: "i" };
  if (category) filter.category = { $regex: escapeRegex(category), $options: "i" };

  return Image.find(filter, PROJECT)
    .sort({ quality_score: -1, popularity_score: -1 })
    .limit(MAX_RESULTS)
    .lean();
}

// ─────────────────────────────────────────────────────────────────────────────
// Tier 3 — Atlas full-text search with score threshold
// ─────────────────────────────────────────────────────────────────────────────
async function matchAtlas(title, food_type) {
  const matchFilter = { premium: true };
  if (food_type) matchFilter.food_type = { $regex: `^${escapeRegex(food_type)}$`, $options: "i" };

  const pipeline = [
    {
      $search: {
        index: "food_atlas_search",
        compound: {
          should: [
            {
              text: {
                query: title,
                path: "title",
                score: { boost: { value: 10 } },
                fuzzy: { maxEdits: 1, prefixLength: 2 },
              },
            },
            {
              autocomplete: {
                query: title,
                path: "title",
                tokenOrder: "sequential",
                score: { boost: { value: 8 } },
              },
            },
            {
              text: {
                query: title,
                path: ["manual_tags", "auto_tags"],
                score: { boost: { value: 4 } },
              },
            },
          ],
          minimumShouldMatch: 1,
          filter: [{ equals: { path: "premium", value: true } }],
        },
      },
    },
    // Compute composite score: atlas × 0.5 + quality × 0.4 + popularity × 0.1
    {
      $addFields: {
        _atlasScore: { $meta: "searchScore" },
        _compositeScore: {
          $add: [
            { $multiply: [{ $meta: "searchScore" }, 0.5] },
            { $multiply: [{ $ifNull: ["$quality_score", 0] }, 0.4] },
            {
              $multiply: [
                { $min: [{ $ifNull: ["$popularity_score", 0] }, 100] },
                0.1,
              ],
            },
          ],
        },
      },
    },
    // Hard filter: score must exceed threshold AND be premium
    { $match: { ...matchFilter, _atlasScore: { $gte: ATLAS_MIN_SCORE } } },
    { $sort: { _compositeScore: -1 } },
    { $limit: MAX_RESULTS },
    {
      $project: {
        ...PROJECT,
        _atlasScore: 1,
        _compositeScore: 1,
      },
    },
  ];

  try {
    return await Image.aggregate(pipeline);
  } catch (err) {
    // Atlas Search may not be available in all environments — fall through gracefully
    console.warn("[match/atlas] Atlas search failed, skipping:", err.message);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/image/match
// ─────────────────────────────────────────────────────────────────────────────
export const POST = async (req) => {
  try {
    await dbConnect();

    const body = await req.json();
    const { title, category, sub_category, food_type } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid 'title' field." },
        { status: 400 }
      );
    }

    const cleanTitle = title.trim();

    console.log(`[match] Item: "${cleanTitle}" | category: ${category} | food_type: ${food_type}`);

    // ── Tier 1: Exact ────────────────────────────────────────────
    let images = await matchExact(cleanTitle, food_type);
    if (images.length > 0) {
      console.log(`[match] Tier 1 (exact) → ${images.length} result(s)`);
      return NextResponse.json({
        success: true,
        matched: true,
        tier: "exact",
        images,
      });
    }

    // ── Tier 2: Word-overlap ─────────────────────────────────────
    images = await matchWordOverlap(cleanTitle, category, food_type);
    if (images.length > 0) {
      console.log(`[match] Tier 2 (word_overlap) → ${images.length} result(s)`);
      return NextResponse.json({
        success: true,
        matched: true,
        tier: "word_overlap",
        images,
      });
    }

    // ── Tier 3: Atlas fuzzy ──────────────────────────────────────
    images = await matchAtlas(cleanTitle, food_type);
    if (images.length > 0) {
      console.log(`[match] Tier 3 (atlas) → ${images.length} result(s)`);
      return NextResponse.json({
        success: true,
        matched: true,
        tier: "atlas",
        images,
      });
    }

    // ── No match ─────────────────────────────────────────────────
    console.log(`[match] No match found for "${cleanTitle}"`);
    return NextResponse.json({
      success: true,
      matched: false,
      tier: null,
      images: [],
    });
  } catch (err) {
    console.error("[match] Error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
};
