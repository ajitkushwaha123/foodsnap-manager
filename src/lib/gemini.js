import axios from "axios";
import { Buffer } from "buffer";
import { GoogleGenerativeAI } from "@google/generative-ai";

const keys = [process.env.GEMINI_API_KEY].filter(Boolean);

if (keys.length === 0) {
  throw new Error("❌ No Gemini API keys found in environment variables.");
}

export function getRandomGeminiClient() {
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return new GoogleGenerativeAI(randomKey.trim());
}

const extractValidJsonObjects = (incompleteJson) => {
  try {
    const cleaned = incompleteJson.replace(/```(?:json)?/g, "").trim();
    const matches = [...cleaned.matchAll(/\{[\s\S]*?\}/g)];
    if (!matches.length) throw new Error("No JSON object found");
    return JSON.parse(matches[0][0]);
  } catch (err) {
    console.error("❌ JSON extraction failed:", err.message);
    return null;
  }
};

const normalizeFoodType = (ft, fallback = "veg") => {
  if (!ft) return fallback;
  const map = {
    veg: "veg",
    vegetarian: "veg",
    non_veg: "non_veg",
    "non-veg": "non_veg",
    nonveg: "non_veg",
    egg: "egg",
    eggetarian: "egg",
  };
  return map[ft.toLowerCase()] || fallback;
};

export const analyzeImageWithGemini = async ({
  image_url,
  userId,
  projectId,
  base_price = 200,
}) => {
  try {
    const imageRes = await axios.get(image_url, {
      responseType: "arraybuffer",
    });
    const base64Image = Buffer.from(imageRes.data).toString("base64");

    const genAI = getRandomGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const contextText = `
Analyze the given food image and provide a structured JSON response with:
{
  "name": "Name of the dish",
  "description": "Short description of the dish",
  "category": "Main category (e.g. Starter, Main Course, Beverage)",
  "sub_category": "Sub category (e.g. Indian, Chinese, Dessert)",
  "food_type": "Type of food (veg, non_veg, egg)"
}

Only return valid JSON without extra text or markdown.
`.trim();

    const result = await model.generateContent([
      { text: contextText },
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image,
        },
      },
    ]);

    const rawText =
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log("🧠 Gemini raw response:", rawText);

    const extracted = extractValidJsonObjects(rawText);
    if (!extracted) throw new Error("Invalid Gemini output");

    const productObject = {
      name: extracted.name || "Untitled Dish",
      description: extracted.description || "",
      img: image_url,
      category: extracted.category || null,
      sub_category: extracted.sub_category || null,
      food_type: normalizeFoodType(extracted.food_type, "veg"),
      variants: [],
      item_type: "Goods",
      base_price: base_price,
      userId: userId,
      projectId: projectId,
      status: "uploaded",
      reason: "",
      status_logs: [
        {
          status: "uploaded",
          reason: "Auto-created after Gemini analysis",
          timestamp: new Date(),
        },
      ],
    };

    return productObject;
  } catch (error) {
    console.error("❌ Gemini analysis failed:", error.message);
    return {
      status: "analysis_failed",
      reason: error.message,
      status_logs: [
        {
          status: "analysis_failed",
          reason: error.message,
          timestamp: new Date(),
        },
      ],
    };
  }
};
