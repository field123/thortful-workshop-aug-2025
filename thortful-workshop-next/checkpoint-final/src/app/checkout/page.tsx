import {CheckoutElements} from "@/app/checkout/CheckoutElements";
import {initializeShopperClient} from "@/lib/epcc-shopper-client";
import {cookies} from "next/headers";
import {CART_COOKIE_KEY} from "@/app/constants";
import {getACart} from "@epcc-sdk/sdks-shopper";

initializeShopperClient()
export default async function CheckoutPage() {
    const cookieStore = await cookies();
    const cartId = cookieStore.get(CART_COOKIE_KEY)?.value;

    if (!cartId) {
        throw new Error("No cart found");
    }

    const response = await getACart({
        path: { cartID: cartId },
        query: {
            include: ['items', 'tax_items', 'custom_discounts', 'promotions'] as const
        }
    });

    if (response.error) {
        throw new Error("Failed to fetch cart");
    }

    return (
        <CheckoutElements cart={response.data} />
    )
}