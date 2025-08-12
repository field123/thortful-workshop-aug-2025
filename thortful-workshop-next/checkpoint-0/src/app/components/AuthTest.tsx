import { getByContextAllProducts, Product } from "@epcc-sdk/sdks-shopper";

export default async function AuthTest() {
  const response = await getByContextAllProducts();
  const products: Product[] = response.data?.data || [];
  const isAuthenticated = products.length > 0;

  return (
    <div className="p-4 font-sans bg-gray-50">
      <main className="max-w-3xl mx-auto bg-white p-6 rounded shadow-sm">
        <div className="pb-3">
          <h1 className="text-xl font-medium mb-2 text-black">
            Authentication Demo
          </h1>
          <p className="text-black">
            Status:{" "}
            {isAuthenticated ? (
              <span className="font-semibold text-green-800">
                Store successfully authenticated
              </span>
            ) : (
              <span className="font-semibold text-red-800">
                Not authenticated
              </span>
            )}
          </p>
          <p className="text-black">
            Products: {products.length} were found in your catalog.
          </p>
        </div>
      </main>
    </div>
  );
}
