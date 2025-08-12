"use server";

import {
  getACart,
  getByContextAllProducts,
  manageCarts,
  extractProductImage,
} from "@epcc-sdk/sdks-shopper";
import { configureClient } from "../lib/api-client";
import { cookies } from "next/headers";
import { COOKIE_PREFIX_KEY } from "./constants";
import { revalidatePath } from "next/cache";

/*
  TUTORIAL STEP: Insert fetch cart action here.
*/

/*
  TUTORIAL STEP: Insert add to cart action here.
*/

export async function fetchProductsAction() {
  try {
    configureClient();

    const response = await getByContextAllProducts({
      query: {
        include: ["main_image"],
      },
    });

    const products = response.data?.data || [];
    const productMainImages = response.data?.included?.main_images || [];

    // Process products to include images
    const processedProducts = products.map((product: any) => {
      const mainImage = extractProductImage(product, productMainImages);
      const imageUrl = mainImage?.link?.href || "/placeholder.jpg";

      return {
        id: product.id,
        name: product.attributes?.name || "Unnamed Product",
        description: product.attributes?.description || "",
        sku: product.attributes?.sku || "",
        imageUrl,
        price: product.meta?.display_price?.with_tax?.formatted || null,
      };
    });

    return {
      success: true,
      products: processedProducts,
      error: null,
    };
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return {
      success: false,
      products: [],
      error: "Failed to fetch products",
    };
  }
}
