import {initializeShopperClient} from "@/lib/epcc-shopper-client";
import {createAnAccessToken, createCartPaymentIntent, getV2AccountMembers, getV2Accounts, checkoutApi} from "@epcc-sdk/sdks-shopper"
import {cookies} from "next/headers";
import {ACCOUNT_COOKIE_KEY, CART_COOKIE_KEY} from "@/app/constants";

initializeShopperClient()

interface RequestData {
    confirmationTokenId: string;
}

export async function POST(request: Request) {
    const req: RequestData = await request.json()

    // Resolve cookies for cart id, account token
    const cookieStore = await cookies();

    const cartId = cookieStore.get(CART_COOKIE_KEY)?.value;
    if (!cartId) {
        return Response.json({ error: "No cart found" }, { status: 400 });
    }
    const accountToken = cookieStore.get(ACCOUNT_COOKIE_KEY)?.value;
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
    const result = await createCartPaymentIntent({
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
                    // currency: "gbp",
                    automatic_payment_methods: { enabled: true },
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

    console.log("Payment intent request: ", result.request.headers, result.request.body);
    console.log("Payment intent result:", result.error, result.data);

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
                    "first_name": "Robert",
                    "last_name": "Field",
                    "company_name": "ElasticPath",
                    "line_1": "1234 Disney Drive",
                    "line_2": "Disney Resort",
                    "city": "Anaheim",
                    "county": "Orange",
                    "region": "CA",
                    "postcode": "92802",
                    "country": "US"
                },
                shipping_address: {
                    "first_name": "Robert",
                    "last_name": "Field",
                    "company_name": "ElasticPath",
                    "phone_number": "(555) 555-1234",
                    "line_1": "1234 Disney Drive",
                    "line_2": "Disney Resort",
                    "city": "Anaheim",
                    "county": "Orange",
                    "region": "CA",
                    "postcode": "92802",
                    "country": "US",
                    "instructions": "Leave in porch"
                }
            }
        }
    })

    // 3. Confirm the order paid to sync with Elastic Path Payments
    // 4 (temporary) manually create subscription from order
    // 5. clear the cart, should set a new cart cookie


    return Response.json({req})
}