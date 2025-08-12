import {initializeShopperClient} from "@/lib/epcc-shopper-client";
import {
    createAnAccessToken,
    createCartPaymentIntent,
    getV2AccountMembers,
    getV2Accounts,
    checkoutApi,
    confirmOrder,
    getACart,
    deleteACart, createACart
} from "@epcc-sdk/sdks-shopper"
import {cookies} from "next/headers";
import {ACCOUNT_MEMBER_TOKEN_COOKIE_KEY, CART_COOKIE_KEY, EPCC_ENDPOINT_URL} from "@/app/constants";
import {temporaryCreateSubscriptionFromOrder} from "@/app/api/checkout/temp-create-subscription-from-order";
import {NextResponse} from "next/server";

initializeShopperClient()

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
    const req: RequestData = await request.json()

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
            'EP-Account-Management-Authentication-Token': accountToken
        }
    });

    if (memberResponse.error) {
        return Response.json({ error: "Failed to fetch member data" }, { status: 500 });
    }

    const accountDataResponse = await getV2Accounts({
        headers: {
            'EP-Account-Management-Authentication-Token': accountToken
        }
    })

    if (accountDataResponse.error) {
        return Response.json({ error: "Failed to fetch account data" }, { status: 500 });
    }

    const memberData = memberResponse.data?.data?.[0];
    const accountData = accountDataResponse.data?.data?.[0];

    // Retrieve the Stripe customer ID from account data
    const stripeCustomerId = (accountData as unknown as { 'stripe-account-id': string })?.['stripe-account-id'];


    console.log("Checkout route called with data:", req);
    console.log("member data:", memberResponse.data);
    console.log("Stripe customer ID:", stripeCustomerId);
    console.log("Account data:", accountDataResponse.data);

    // 0. create a client credentials shopper client
    const clientCredentialsToken = await createAnAccessToken({
        body: {
            grant_type: "client_credentials",
            client_id: process.env.NEXT_PUBLIC_EPCC_CLIENT_ID!,
            client_secret: process.env.EPCC_CLIENT_SECRET!,
        },
    })

    if (clientCredentialsToken.error) {
        return Response.json({ error: "Failed to create client credentials token" }, { status: 500 });
    }

    console.log("Client credentials token result:", clientCredentialsToken.error, clientCredentialsToken.data);

    /**
     * 1. Set payment intent on cart
      */
    const paymentResult = await createCartPaymentIntent({
        path: {
            cartID: cartId,
        },
        headers: {
            'Authorization': `Bearer ${clientCredentialsToken.data.access_token}`,
        },
        body: {
            data: {
                gateway: "elastic_path_payments_stripe",
                method: "purchase",
                options: {
                    automatic_payment_methods: { enabled: true },
                    // @ts-expect-error sdk does not have the correct type for this
                    confirm: true,
                    confirmation_token: req.confirmationTokenId,
                    receipt_email: memberData?.email,
                    customer: stripeCustomerId,
                    // Not handling redirects as part of this example
                    return_url: "https://placeholder.com",
                    setup_future_usage: "off_session",
                }
            }
        }
    })

    console.log("Payment intent request: ", paymentResult.request.headers, paymentResult.request.body);
    console.log("Payment intent result:", paymentResult.error, paymentResult.data);

    /**
     * 2. Perform checkout to turn cart into order
      */
    const checkoutResponse = await checkoutApi({
        path: {
            cartID: cartId,
        },
        body: {
            data: {
                account: {
                    id: accountData?.id,
                    member_id: memberData?.id
                },
                contact: {
                    email: memberData?.email,
                    name: memberData?.name
                },
                billing_address: {
                    first_name: req.billingAddress.first_name,
                    last_name: req.billingAddress.last_name,
                    line_1: req.billingAddress.line_1,
                    line_2: req.billingAddress.line_2 ?? '',
                    city: req.billingAddress.city,
                    region: req.billingAddress.region ?? '',
                    postcode: req.billingAddress.postcode,
                    country: req.billingAddress.country,
                    company_name: "",
                    county: "",
                },
                shipping_address: {
                    first_name: req.billingAddress.first_name,
                    last_name: req.billingAddress.last_name,
                    line_1: req.billingAddress.line_1,
                    line_2: req.billingAddress.line_2 ?? '',
                    city: req.billingAddress.city,
                    region: req.billingAddress.region ?? '',
                    postcode: req.billingAddress.postcode,
                    country: req.billingAddress.country,
                    company_name: "",
                    county: "",
                    phone_number: "",
                    instructions: ""
                }
            }
        }
    })

    console.log("Checkout response:", checkoutResponse.error, checkoutResponse.data);

    if (checkoutResponse.error) {
        return Response.json({ error: "Failed to checkout" }, { status: 500 });
    }

    /**
     * 3. Confirm the order paid to sync with Elastic Path Payments
      */

    const orderId = checkoutResponse.data.data?.id!;
    const orderConfirmationResponse = await confirmOrder({
        path: {
            orderID: orderId,
        },
        // @ts-expect-error the body is not typed correctly in the SDK
        body: {
            data: {
                options: {
                    metadata: {
                        order_id: orderId,
                        "statement_descriptor": "Confirmed intent"
                    }
                }
            }
        }
    })

    console.log("Order confirmation response:", orderConfirmationResponse.error, orderConfirmationResponse.data);
    if (orderConfirmationResponse.error) {
        return Response.json({ error: "Failed to confirm order" }, { status: 500 });
    }

    /**
     * 4 (temporary) manually create subscription from order
      */

    const cartResponse = await getACart({
        path: {
            cartID: cartId,
        },
        query: {
            include: ['items']
        }
    })

    if (cartResponse.error) {
        return Response.json({ error: "Failed to fetch cart" }, { status: 500 });
    }

    console.log("Payment method id: ", (paymentResult.data as any)?.meta?.payment_intent?.payment_intent?.payment_method?.id)

    const subsCreationResult = await temporaryCreateSubscriptionFromOrder({
        orderId: orderId,
        clientCredentialsAccessToken: clientCredentialsToken.data.access_token!,
        cart: cartResponse.data,
        accountData: accountData!,
        stripeCustomerId,
        memberData: memberData!,
        paymentMethodId: (paymentResult.data as any)?.meta?.payment_intent?.payment_intent?.payment_method?.id
    })


    /**
     * 5. clear the cart
      */

    const deleteCartResponse = await deleteACart({
        path: {
            cartID: cartId
        },
    })

    if (deleteCartResponse.error) {
        return Response.json({ error: "Failed to delete cart" }, { status: 500 });
    }

    console.log("Delete cart response:", deleteCartResponse.error, deleteCartResponse.data);

    /**
     * 6. set new cart cookie
     */

    const createdCart = await createACart({
        baseUrl: EPCC_ENDPOINT_URL,
        body: {
            data: {
                name: "Cart",
            },
        },
    });

    if (createdCart.error) {
        return Response.json({ error: "Failed to create new cart" }, { status: 500 });
    }

    console.log("Created new cart:", createdCart.data);

    const res = NextResponse.json({ successUrl: new URL(`/checkout/success/${orderId}`, request.url).toString() }, { status: 200 });

    res.cookies.set(
        CART_COOKIE_KEY,
        createdCart.data?.data?.id!,
        {
            sameSite: "strict",
            expires: new Date(
                (createdCart.data?.data?.meta?.timestamps as any)?.expires_at
            ),
        }
    );

    return res;
}


