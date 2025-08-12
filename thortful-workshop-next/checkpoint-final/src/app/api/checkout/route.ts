import {initializeShopperClient} from "@/lib/epcc-shopper-client";
import {createCartPaymentIntent} from "@epcc-sdk/sdks-shopper"

initializeShopperClient()

export async function POST(request: Request) {
    const res = await request.json()

    console.log("Checkout route called with data:", res);

    // 0. create a client credentials shopper client
    // 0.5. create customer account if not authenticated already

    // 1. Set payment intent on cart
    // const result = await createCartPaymentIntent({
    //     body: {
    //         data: {
    //             gateway: "elastic_path_payments_stripe",
    //             method: "purchase",
    //             options: {
    //                 currency: "gbp",
    //                 automatic_payment_methods: {
    //                     "enabled": true
    //                 },
    //                 confirm: true,
    //                 confirmation_token: "ctoken_1RvKilS0zgcHkTppRRDcc1XR",
    //                 receipt_email: "robert.field@elasticpath.com",
    //                 customer: "cus_SqzrXrHDNthWdn",
    //                 setup_future_usage: "off_session"
    //             }
    //         }
    //     }
    // })

    // 2. Perform checkout to turn cart into order
    // 3. Confirm the order paid to sync with Elastic Path Payments
    // 4 (temporary) manually create subscription from order


    return Response.json({res})
}