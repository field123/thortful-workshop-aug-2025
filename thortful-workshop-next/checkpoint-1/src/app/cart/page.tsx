import Header from "../components/Header";
import Footer from "../components/Footer";
import CartItem from "../components/CartItem";
import CartSummary from "../components/CartSummary";

// Mock cart data for demonstration
const mockCartItems = [
  {
    id: "1",
    title: "Happy Birthday Card - Funny Cat",
    price: 4.99,
    quantity: 1,
    image:
      "https://images.thortful.com/card/669a344810eebe054a811c80/669a344810eebe054a811c80_medium.jpg?version=1",
    creator: "Cute Cat Cards Co.",
  },
  {
    id: "2",
    title: "Anniversary Card - Love Birds",
    price: 3.99,
    quantity: 2,
    image:
      "https://images.thortful.com/card/62cd3f165026790001d8be9f/62cd3f165026790001d8be9f_medium.jpg?version=1",
    creator: "Romantic Designs Ltd.",
  },
];

export default function CartPage() {
  const subtotal = mockCartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const shipping = 2.99;
  const total = subtotal + shipping;

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-[1200px] mx-auto px-[15px] py-8">
          <h1 className="text-3xl font-bold mb-8">Your Basket</h1>

          {mockCartItems.length === 0 ? (
            <div className="text-center py-16">
              <h2 className="text-2xl font-semibold mb-4">
                Your basket is empty
              </h2>
              <p className="text-gray-600 mb-8">
                Start shopping to add items to your basket
              </p>
              <a
                href="/"
                className="inline-block bg-[#f57c00] text-white px-8 py-3 rounded-lg hover:bg-[#ef6c00] transition-colors"
              >
                Continue Shopping
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold">
                      Items in your basket
                    </h2>
                  </div>
                  <div className="divide-y">
                    {mockCartItems.map((item) => (
                      <CartItem key={item.id} item={item} />
                    ))}
                  </div>
                </div>

                {/* Continue Shopping */}
                <div className="mt-6">
                  <a
                    href="/"
                    className="inline-flex items-center text-[#f57c00] hover:text-[#ef6c00] transition-colors"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Continue Shopping
                  </a>
                </div>
              </div>

              {/* Cart Summary */}
              <div className="lg:col-span-1">
                <CartSummary
                  subtotal={subtotal}
                  shipping={shipping}
                  total={total}
                  itemCount={mockCartItems.reduce(
                    (count, item) => count + item.quantity,
                    0
                  )}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
