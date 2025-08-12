'use server';

import { revalidatePath } from 'next/cache';
import { manageCarts } from '@epcc-sdk/sdks-shopper';
import { cookies } from 'next/headers';
import { initializeShopperClient } from "@/lib/epcc-shopper-client";
import { CART_COOKIE_KEY } from "@/app/constants";


export async function addSubscriptionToCart(offeringId: string, planId: string, pricingOptionId: string) {
  initializeShopperClient();
  const cookieStore = await cookies();
  let cartId = cookieStore.get(CART_COOKIE_KEY)?.value;

  if (!cartId) {
    throw new Error('Cart has not been initialized');
  }

  try {

    const body = {
      data: {
        type: 'subscription_item' as const,
        quantity: 1,
        id: offeringId,
        subscription_configuration: {
          plan: planId,
          pricing_option: pricingOptionId
        }
      }
    };

    await manageCarts({
      path: { cartID: cartId },
      body
    });

    revalidatePath('/cart');
    return { success: true };
  } catch (error) {
    console.error('Failed to add subscription to cart:', error);
    return { success: false, error: 'Failed to add subscription to cart' };
  }
}