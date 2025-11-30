import axios from "axios";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    // 1️⃣ Extract payload from request body
    const payload = await req.json();

    // 2️⃣ Make request to Zomato
    const response = await axios.post(
      "https://www.zomato.com/php/online_ordering/menu_edit.php?action=update_content_menu&res_id=21047451&service_role=DELIVERY_TAKEAWAY",
      payload,
      {
        headers: {
          Cookie: process.env.ZOMATO_COOKIES,
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
          Origin: "https://www.zomato.com",
          Referer: "https://www.zomato.com/",
          "X-Requested-With": "XMLHttpRequest",
        },
      }
    );

    console.log("✅ Zomato Response:", response.data);

    return NextResponse.json(
      {
        success: true,
        data: response.data, // return only actual data
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Worker Error:", err.response?.data || err.message);

    return NextResponse.json(
      {
        success: false,
        error:
          err.response?.data?.message ||
          err.response?.data ||
          "Unexpected error while calling Zomato",
      },
      { status: err.response?.status || 500 }
    );
  }
};

// OPTIONAL: handle OPTIONS for CORS (if calling from frontend)
export const OPTIONS = async () => {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    }
  );
};
