import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";

export const POST = async (req) => {
  try {
    await dbConnect();

    // Get prompt and images from body
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const MODEL_ID = "gemini-2.5-flash-image";
    const API_KEY = process.env.GEMINI_API_KEY;
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:streamGenerateContent?key=${API_KEY}`;

    const body = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                prompt ||
                "Create a single realistic and professional combo image from these two photos.",
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ["IMAGE"],
        imageConfig: {
          aspectRatio: "4:3",
          image_size: "1K",
        },
      },
    };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini error:", errText);
      return NextResponse.json(
        { error: "Gemini API error", details: errText },
        { status: 500 }
      );
    }

    // Parse Gemini response
    const data = await response.json();
    const imageBase64 =
      data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!imageBase64) {
      return NextResponse.json(
        { error: "No image data returned from Gemini" },
        { status: 500 }
      );
    }

    // Return generated image (base64)
    return NextResponse.json({ image: imageBase64 });
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json(
      { error: "Failed to process the request" },
      { status: 500 }
    );
  }
};
