import { addScrapedProductFromZomatoToQueue } from "@/lib/bullmq/jobs/addScrapedProductFromZomatoToQueue";
import dbConnect from "@/lib/dbConnect";
import axios from "axios";
import { NextResponse } from "next/server";

export const POST = async (req, { params }) => {
  try {
    const { userId, projectId } = await params;
    if (!userId || !projectId) {
      return NextResponse.json(
        { error: "Missing 'userId' or 'projectId' in URL parameters!" },
        { status: 400 }
      );
    }

    await dbConnect();

    const { pageUrl } = await req.json();
    if (!pageUrl) {
      return NextResponse.json(
        {
          error: "Missing 'pageUrl' in request!",
          details: "'pageUrl' is required.",
        },
        { status: 400 }
      );
    }

    const parsed = parseZomatoUrl(pageUrl);
    if (!parsed) {
      return NextResponse.json(
        {
          error: "Invalid Zomato URL",
          details: "Could not extract restaurant info.",
        },
        { status: 400 }
      );
    }

    const { location, restaurant } = parsed;
    const targetUrl = `https://www.zomato.com/webroutes/getPage?page_url=/${location}/${restaurant}/order`;

    console.log(`🌐 Fetching Zomato data from: ${targetUrl}`);
    console.log(`👤 User: ${userId} | 📁 Project: ${projectId}`);

    const response = await axios.get(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
        Accept: "application/json, text/plain, */*",
        Referer: `https://www.zomato.com/${location}/${restaurant}`,
        "Accept-Language": "en-US,en;q=0.9",
      },
      timeout: 20000,
    });

    const menu = response.data;

    if (!menu?.page_data?.order?.menuList?.menus) {
      return NextResponse.json(
        { error: "No menu data found on the provided Zomato page." },
        { status: 404 }
      );
    }

    const title = menu.page_info.pageTitle || "";
    const menuData = menu.page_data.order.menuList.menus;
    const zomatoProducts = [];
    const categories = [];

    for (const table of menuData) {
      const category_data = table.menu || {};
      const category_name = category_data.name?.trim();
      if (!category_name) continue;

      const subCategories = [];

      for (const categories_table of category_data.categories || []) {
        const sub_category_name =
          categories_table.category?.name?.trim() || category_name;
        subCategories.push(sub_category_name);

        for (const item of categories_table.category?.items || []) {
          const product = item.item || {};

          zomatoProducts.push({
            name: product.name || "",
            description: product.desc || "",
            img: product.item_image_url || "",
            base_price: product.display_price || 0,
            category: category_name,
            sub_category: sub_category_name,
            food_type: product.tag_slugs?.[0] || "",
            item_type: "Goods",
          });
        }
      }

      categories.push({
        name: category_name,
        sub_categories: subCategories,
      });
    }

    addScrapedProductFromZomatoToQueue({
      userId,
      projectId,
      title,
      categories,
      products: zomatoProducts,
    });

    return NextResponse.json({
      success: true,
      message: `✅ Menu data parsed successfully for user ${userId}, project ${projectId}`,
      total_products: zomatoProducts.length,
      total_categories: categories.length,
      data: {
        categories,
        products: zomatoProducts,
      },
    });
  } catch (err) {
    console.error("❌ Zomato Fetch Error:", err.message);
    return NextResponse.json(
      { success: false, error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
};

export function parseZomatoUrl(url) {
  try {
    if (!/^https?:\/\//i.test(url)) {
      if (url.startsWith("zomato.com")) {
        url = "https://" + url;
      } else {
        url = "https://www.zomato.com/" + url.replace(/^\/+/, "");
      }
    }

    const parsedUrl = new URL(url);

    if (!parsedUrl.hostname.includes("zomato.com")) {
      throw new Error("Not a valid Zomato URL");
    }

    let parts = parsedUrl.pathname.split("/").filter(Boolean);
    const trailingSegments = ["order", "menu", "photos", "info", "reviews"];
    if (trailingSegments.includes(parts[parts.length - 1])) {
      parts.pop();
    }

    const location = parts[0];
    const restaurant = parts[1];

    if (!location || !restaurant)
      throw new Error("Invalid Zomato restaurant URL");

    return { location, restaurant };
  } catch (err) {
    console.error("Failed to parse Zomato URL:", err.message);
    return null;
  }
}
