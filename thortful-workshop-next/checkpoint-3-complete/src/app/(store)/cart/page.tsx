import Image from "next/image";
import Link from "next/link";
import {getACart} from "@epcc-sdk/sdks-shopper";
import {initializeShopperClient} from "@/lib/epcc-shopper-client";
import {cookies} from "next/headers";
import {CART_COOKIE_KEY} from "@/app/constants";

initializeShopperClient()
export default async function CartPage() {

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

    const items = response.data?.included?.items || [];
    const isEmpty = items.length === 0;

    if (isEmpty) {
        return (
            <div className="max-w-[1200px] mx-auto px-[15px] py-8">
                <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <div className="mb-6">
                        <Image
                            src="/basket-icon.svg"
                            alt="Empty cart"
                            width={64}
                            height={64}
                            className="mx-auto opacity-50"
                        />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
                    <p className="text-gray-600 mb-6">
                        Add some items to your cart to get started.
                    </p>
                    <Link
                        href="/"
                        className="inline-block bg-[#f57c00] text-white px-6 py-3 rounded-lg hover:bg-[#ef6c00] transition-colors"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] mx-auto px-[15px] py-8">
            <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-sm">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold">
                                Cart Items ({items.length}{" "}
                                {items.length === 1 ? "item" : "items"})
                            </h2>
                        </div>

                        <div className="p-6">
                            <div className="space-y-6">
                                {items.map((item: any) => (
                                    <div
                                        key={item.id}
                                        className="flex gap-4 pb-6 border-b border-gray-100 last:border-b-0"
                                    >
                                        {/* Product Image */}
                                        <div className="flex-shrink-0">
                                            <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                                                {item.image?.href ? (
                                                    <Image
                                                        src={item.image.href}
                                                        alt={item.name}
                                                        width={96}
                                                        height={96}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-400 text-xs">
                                  No image
                                </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex-grow">
                                            <h3 className="font-semibold text-gray-900 mb-1">
                                                {item.name}
                                            </h3>
                                            {item.description && (
                                                <p className="text-sm text-gray-600 mb-2">
                                                    {item.description}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-4">
                                                <div className="text-lg font-semibold text-[#f57c00]">
                                                    {item.meta.display_price.with_tax.unit.formatted}
                                                </div>

                                                {/* Quantity Controls */}
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        // onClick={() =>
                                                        //     handleQuantityChange(
                                                        //         item.id,
                                                        //         Math.max(1, item.quantity - 1)
                                                        //     )
                                                        // }
                                                        // disabled={isUpdating || item.quantity <= 1}
                                                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-8 text-center font-medium">
                                {item.quantity}
                              </span>
                                                    <button
                                                        // onClick={() =>
                                                        //     handleQuantityChange(
                                                        //         item.id,
                                                        //         item.quantity + 1
                                                        //     )
                                                        // }
                                                        // disabled={isUpdating}
                                                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                {/* Remove Button */}
                                                <button
                                                    // onClick={() => handleRemoveItem(item.id)}
                                                    // disabled={isUpdating}
                                                    className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Remove
                                                </button>
                                            </div>

                                            {/* Line Total */}
                                            <div className="mt-2 text-right">
                            <span className="font-semibold">
                              {item.meta.display_price.with_tax.value.formatted}
                            </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cart Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>
                      {response.data?.data?.meta?.display_price?.without_tax?.formatted}
                    </span>
                            </div>

                            {response.data?.data?.meta?.display_price?.tax && (
                                <div className="flex justify-between">
                                    <span>Tax</span>
                                    <span>{response.data?.data?.meta?.display_price?.tax?.formatted}</span>
                                </div>
                            )}

                            <div className="border-t border-gray-200 pt-3">
                                <div className="flex justify-between font-semibold text-lg">
                                    <span>Total</span>
                                    <span className="text-[#f57c00]">
                        {response.data?.data?.meta?.display_price?.with_tax?.formatted}
                      </span>
                                </div>
                            </div>
                            <Link href="/checkout">
                                <button
                                    type="button"
                                    // disabled={isUpdating}
                                    className="w-full bg-[#f57c00] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#ef6c00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Proceed to Checkout
                                    {/*{isUpdating ? "Updating..." : "Proceed to Checkout"}*/}
                                </button>
                            </Link>
                            <Link
                                href="/"
                                className="block text-center text-[#f57c00] hover:text-[#ef6c00] mt-4 transition-colors"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}