import Link from "next/link";

interface CartSummaryProps {
  subtotal: number;
  shipping: number;
  total: number;
  itemCount: number;
}

export default function CartSummary({
  subtotal,
  shipping,
  total,
  itemCount,
}: CartSummaryProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
      <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

      {/* Summary Details */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between">
          <span className="text-gray-600">Items ({itemCount})</span>
          <span className="font-medium">£{subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Delivery</span>
          <span className="font-medium">£{shipping.toFixed(2)}</span>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-lg font-semibold">£{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <Link
        href="/checkout"
        className="w-full bg-[#f57c00] text-white py-3 px-6 rounded-lg hover:bg-[#ef6c00] 
                   transition-colors font-semibold text-center block"
      >
        Proceed to Checkout
      </Link>

      {/* Delivery Information */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-sm mb-2">Delivery Options</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>2nd Class (3-5 working days)</span>
            <span>£2.99</span>
          </div>
          <div className="flex justify-between">
            <span>1st Class (1-3 working days)</span>
            <span>£3.99</span>
          </div>
          <div className="flex justify-between">
            <span>Next Day Delivery</span>
            <span>£4.99</span>
          </div>
        </div>
      </div>

      {/* Security Badge */}
      <div className="mt-6 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
          <span>Secure Checkout</span>
        </div>
      </div>

      {/* Promotional Banner */}
      <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
        <p className="text-sm text-green-700 font-medium">
          Free delivery on orders over £15
        </p>
        <p className="text-xs text-green-600 mt-1">
          Add £{Math.max(0, 15 - subtotal).toFixed(2)} more to qualify
        </p>
      </div>
    </div>
  );
}
