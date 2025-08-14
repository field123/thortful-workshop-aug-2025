import { initializeShopperClient } from "@/lib/epcc-shopper-client";
import {
  createAnAccessToken,
  createCartPaymentIntent,
  getV2AccountMembers,
  getV2Accounts,
  checkoutApi,
  confirmOrder,
  getACart,
  deleteACart,
  createACart,
} from "@epcc-sdk/sdks-shopper";
import { cookies } from "next/headers";
import {
  ACCOUNT_MEMBER_TOKEN_COOKIE_KEY,
  CART_COOKIE_KEY,
  EPCC_ENDPOINT_URL,
} from "@/app/constants";
import { temporaryCreateSubscriptionFromOrder } from "@/app/api/checkout/temp-create-subscription-from-order";
import { NextResponse } from "next/server";

initializeShopperClient();

interface RequestData {
  confirmationTokenId: string;
  customer?: {
    email: string;
    name: string;
  };
  billingAddress: {
    first_name: string;
    last_name: string;
    line_1: string;
    line_2?: string;
    city: string;
    region?: string;
    postcode: string;
    country: string;
  };
}

export async function POST(request: Request) {
  const req: RequestData = await request.json();

  // Resolve cookies for cart id, account token
  const cookieStore = await cookies();

  const cartId = cookieStore.get(CART_COOKIE_KEY)?.value;
  if (!cartId) {
    return Response.json({ error: "No cart found" }, { status: 400 });
  }
  const accountToken = cookieStore.get(ACCOUNT_MEMBER_TOKEN_COOKIE_KEY)?.value;
  if (!accountToken) {
    return Response.json({ error: "No account token found" }, { status: 401 });
  }

  const memberResponse = await getV2AccountMembers({
    headers: {
      "EP-Account-Management-Authentication-Token": accountToken,
    },
  });

  if (memberResponse.error) {
    return Response.json(
      { error: "Failed to fetch member data" },
      { status: 500 }
    );
  }

  const accountDataResponse = await getV2Accounts({
    headers: {
      "EP-Account-Management-Authentication-Token": accountToken,
    },
  });

  if (accountDataResponse.error) {
    return Response.json(
      { error: "Failed to fetch account data" },
      { status: 500 }
    );
  }

  const memberData = memberResponse.data?.data?.[0];
  const accountData = accountDataResponse.data?.data?.[0];

  // Retrieve the Stripe customer ID from account data
  const stripeCustomerId = (
    accountData as unknown as { "stripe-account-id": string }
  )?.["stripe-account-id"];

  // 0. create a client credentials shopper client

  /**
   * 1. Set payment intent on cart
   */

  /**
   * 2. Perform checkout to turn cart into order
   */

  /**
   * 3. Confirm the order paid to sync with Elastic Path Payments
   */

  /**
   * 4 (temporary) manually create subscription from order
   */

  /**
   * 5. clear the cart
   */

  /**
   * 6. set new cart cookie
   */
}
