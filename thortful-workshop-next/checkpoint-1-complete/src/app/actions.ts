/*
  TUTORIAL STEP: Insert fetch cart actions here.
*/

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

export async function fetchCartAction() {
  try {
    configureClient();

    const cookieStore = await cookies();
    const cartCookie = cookieStore.get(`${COOKIE_PREFIX_KEY}_ep_cart`);

    if (!cartCookie?.value) {
      return {
        success: false,
        error: "No cart found",
        cart: null,
      };
    }

    const response = await getACart({
      path: {
        cartID: cartCookie.value,
      },
      query: {
        include: ["items"],
      },
    });

    return {
      success: true,
      cart: response.data,
      error: null,
    };
  } catch (error) {
    console.error("Failed to fetch cart:", error);
    return {
      success: false,
      error: "Failed to fetch cart data",
      cart: null,
    };
  }
}

// TUTORIAL STEP: Insert add to cart action here.

export async function addToCartAction(productId: string, quantity: number = 1) {
  try {
    configureClient();

    const cookieStore = await cookies();
    const cartCookie = cookieStore.get(`${COOKIE_PREFIX_KEY}_ep_cart`);

    if (!cartCookie?.value) {
      return {
        success: false,
        error: "No cart found",
        data: null,
      };
    }

    const response = await manageCarts({
      path: {
        cartID: cartCookie.value,
      },
      body: {
        data: {
          type: "cart_item",
          id: productId,
          quantity: quantity,
        },
      },
    });

    revalidatePath("/cart");

    return {
      success: true,
      data: response.data,
      error: null,
    };
  } catch (error) {
    console.error("Failed to add item to cart:", error);
    return {
      success: false,
      error: "Failed to add item to cart",
      data: null,
    };
  }
}

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
