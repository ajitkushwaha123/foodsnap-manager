import dbConnect from "@/lib/dbConnect";
import { uploadToS3 } from "@/lib/upload-service/uploadToAws";
import Product from "@/model/Product";
import axios from "axios";
import FormData from "form-data";
import { NextResponse } from "next/server";

const updateStatus = async (
  productId,
  userId,
  projectId,
  status,
  reason = ""
) => {
  if (!productId || !userId || !projectId) return;

  await Product.findOneAndUpdate(
    { _id: productId, userId, projectId },
    {
      $set: { status, reason },
      $push: {
        status_logs: {
          status,
          reason,
          timestamp: new Date(),
        },
      },
    }
  );
};

export const POST = async (req) => {
  let payload = {};

  try {
    await dbConnect();
    payload = await req.json();

    const {
      image_url,
      title,
      category,
      sub_category,
      food_type,
      description,
      productId,
      userId,
      projectId,
    } = payload;

    if (!image_url) {
      return NextResponse.json(
        { success: false, error: "Missing required field: image_url" },
        { status: 400 }
      );
    }

    await updateStatus(
      productId,
      userId,
      projectId,
      "uploading",
      "Started uploading image to Zomato"
    );

    console.log("📥 Received image for verification:", image_url);

    const imageResponse = await axios.get(image_url, {
      responseType: "arraybuffer",
    });

    const form = new FormData();
    form.append("is_charge_image", "0");
    form.append("is_addon_item", "0");
    form.append("res_id", "21047451");
    form.append("data_file", Buffer.from(imageResponse.data), {
      filename: "upload_image.png",
      contentType: "image/png",
    });

    console.log("📤 Uploading image to Zomato...");

    const { data } = await axios.post(
      "https://www.zomato.com/php/online_ordering/menu_edit?action=upload_image&service_role=DELIVERY_TAKEAWAY&page_key=menu",
      form,
      {
        headers: {
          ...form.getHeaders(),
          Cookie: process.env.ZOMATO_COOKIES,
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
          Origin: "https://www.zomato.com",
          Referer: "https://www.zomato.com/",
          "X-Requested-With": "XMLHttpRequest",
        },
      }
    );

    console.log("✅ Zomato upload response:", data);

    if (!(data?.success && data?.data)) {
      await updateStatus(
        productId,
        userId,
        projectId,
        "rejected",
        data?.message || "Zomato upload failed"
      );
      return NextResponse.json(
        { success: false, message: data?.message || "Zomato upload failed" },
        { status: 400 }
      );
    }

    const {
      image_stock_info,
      image_hash,
      image_url: zomato_image_url,
      width,
      height,
      image_scores,
      images_data,
    } = data.data;

    if (image_stock_info?.isStock) {
      await updateStatus(
        productId,
        userId,
        projectId,
        "rejected",
        "Image rejected by Zomato (stock detected)"
      );
      return NextResponse.json(
        {
          success: true,
          message: "Image rejected by Zomato (stock detected)",
          metaData: { image_stock_info },
        },
        { status: 200 }
      );
    }

    await updateStatus(
      productId,
      userId,
      projectId,
      "uploaded",
      "Image uploaded successfully to Zomato"
    );

    const aws_img_url = await uploadToS3(zomato_image_url, "foodsnap");

    console.log("🔍 Sending for analysis...");

    const analyzeResponse = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/library/upload/analyze`,
      {
        image_url: aws_img_url,
        title,
        category: category?.name || "",
        sub_category: sub_category?.name || "",
        food_type,
        description,
        productId,
      }
    );

    console.log("📦 Analyze response:", analyzeResponse.data);

    if (analyzeResponse.data?.success === false) {
      return NextResponse.json(
        {
          success: false,
          message: analyzeResponse.data?.error || "Image analysis failed",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Image accepted, uploaded, and analyzed successfully",
        image_hash,
        image_url: aws_img_url,
        metaData: {
          width,
          height,
          image_scores,
          image_quality_score: images_data?.imageQualityScore,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Worker error:", err.response?.data || err.message);

    if (payload?.productId && payload?.userId && payload?.projectId) {
      await updateStatus(
        payload.productId,
        payload.userId,
        payload.projectId,
        "failed",
        err.response?.data?.message || err.message
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          err.response?.data?.message ||
          "Unexpected error during Zomato or analysis workflow",
      },
      { status: 500 }
    );
  }
};
