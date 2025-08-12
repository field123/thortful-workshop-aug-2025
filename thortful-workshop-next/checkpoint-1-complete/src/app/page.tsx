import Header from "./components/Header";
import HeroCarousel from "./components/HeroCarousel";
import TrustpilotWidget from "./components/TrustpilotWidget";
import ProductSection from "./components/ProductSection";
import Footer from "./components/Footer";
import Image from "next/image";
import Link from "next/link";
import { configureClient } from "../lib/api-client";
import { fetchProductsAction } from "./actions";

configureClient();

export default async function Home() {
  // Fetch real products from Elastic Path
  const productsResult = await fetchProductsAction();
  const realProducts = productsResult.success ? productsResult.products : [];

  // Create sections from real products
  const customerFavourites = realProducts.slice(0, 4).map((product) => ({
    id: product.id,
    href: `/products/${product.id}`,
    image: product.imageUrl,
    title: product.name,
    price: product.price,
  }));

  const birthdayByRecipient = realProducts.slice(4, 8).map((product) => ({
    id: product.id,
    href: `/products/${product.id}`,
    image: product.imageUrl,
    title: product.name,
    price: product.price,
  }));

  const giftingRange = realProducts.slice(8, 12).map((product) => ({
    id: product.id,
    href: `/products/${product.id}`,
    image: product.imageUrl,
    title: product.name,
    price: product.price,
  }));

  const birthdayByStyle = realProducts.slice(12, 16).map((product) => ({
    id: product.id,
    href: `/products/${product.id}`,
    image: product.imageUrl,
    title: product.name,
    price: product.price,
  }));

  // Fallback demo data if no real products
  const fallbackProducts = [
    {
      href: "/cards/birthday",
      image:
        "https://images.thortful.com/card/669a344810eebe054a811c80/669a344810eebe054a811c80_medium.jpg?version=1",
      title: "Birthday Cards",
    },
    {
      href: "/cards/anniversary",
      image:
        "https://images.thortful.com/card/62cd3f165026790001d8be9f/62cd3f165026790001d8be9f_medium.jpg?version=1",
      title: "Anniversary Cards",
    },
    {
      href: "/card-packs",
      image:
        "https://strapi-media.thortful.com/cdn-cgi/image/width=250,format=auto,quality=90/First_Image_Birthday_Pack_9_Cheeky_ab5c6da632.jpg",
      title: "Card Packs",
    },
    {
      href: "/cards/congratulations",
      image:
        "https://images.thortful.com/card/643eaf15d982cd2234ed9b2a/643eaf15d982cd2234ed9b2a_medium.jpg?version=1",
      title: "Congratulations Cards",
    },
  ];

  return (
    <>
      <Header />

      <main>
        <HeroCarousel />
        <TrustpilotWidget />

        {realProducts.length > 0 ? (
          <>
            <ProductSection
              title="Customer Favourites"
              products={customerFavourites}
              showAddToCart={true}
            />

            {birthdayByRecipient.length > 0 && (
              <ProductSection
                title="Birthday by Recipient"
                viewAllLink="/cards/birthday"
                products={birthdayByRecipient}
                showAddToCart={true}
              />
            )}

            {giftingRange.length > 0 && (
              <ProductSection
                title="Shop Our Gifting Range"
                viewAllLink="/gifts"
                viewAllText="Browse Gift Ideas"
                products={giftingRange}
                showAddToCart={true}
              />
            )}

            {birthdayByStyle.length > 0 && (
              <ProductSection
                title="Birthday by Style"
                viewAllLink="/cards/birthday"
                products={birthdayByStyle}
                showAddToCart={true}
              />
            )}
          </>
        ) : (
          <ProductSection
            title="Customer Favourites"
            products={fallbackProducts}
            showAddToCart={false}
          />
        )}

        {/* App promotion banner */}
        <section className="bg-[#f5f5f5] py-6">
          <div className="max-w-[1200px] mx-auto px-[15px]">
            <Link
              href="https://link-app.thortful.com/ztJf/hk6ykwq0"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <div className="relative h-[120px] md:h-[150px] overflow-hidden">
                <Image
                  src="https://images-fe.thortful.com/cdn-cgi/image/format=auto,%20quality=60/img/banners/app-promo-banner-android-bau.jpg"
                  alt="get the android app on play store"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1200px) 100vw, 1200px"
                />
              </div>
            </Link>
          </div>
        </section>

        {/* SEO content */}
        <section className="max-w-[1200px] mx-auto px-[15px] py-12 text-center">
          <h1 className="text-3xl font-bold mb-6">
            The UK's First Online Greeting Card Marketplace
          </h1>
          <p className="text-gray-600 max-w-4xl mx-auto leading-relaxed">
            We are the largest online greeting cards marketplace, supported by a
            community of independent{" "}
            <Link
              href="/creators/list"
              className="text-[#f57c00] hover:underline"
            >
              creators
            </Link>
            , illustrators and photographers who are the master minds behind our
            truly unique card creations. We have thousands of greeting cards for
            every occasion to choose from online, including{" "}
            <Link
              href="/cards/birthday"
              className="text-[#f57c00] hover:underline"
            >
              Birthday cards
            </Link>
            ,{" "}
            <Link
              href="/cards/birthday/child"
              className="text-[#f57c00] hover:underline"
            >
              Kids Birthday cards
            </Link>
            ,{" "}
            <Link
              href="/cards/anniversary"
              className="text-[#f57c00] hover:underline"
            >
              Anniversary cards
            </Link>
            ,{" "}
            <Link
              href="/personalised-photo-cards"
              className="text-[#f57c00] hover:underline"
            >
              Personalised cards
            </Link>{" "}
            <Link
              href="/cards/wedding"
              className="text-[#f57c00] hover:underline"
            >
              Wedding cards
            </Link>
            ,{" "}
            <Link
              href="/cards/new-baby"
              className="text-[#f57c00] hover:underline"
            >
              New Baby cards
            </Link>{" "}
            and{" "}
            <Link
              href="/cards/new-home"
              className="text-[#f57c00] hover:underline"
            >
              New Home cards
            </Link>
            . And all of our cards are available with next day card delivery,
            for those last-minute moments - just order before 6pm and your card
            will be dispatched the same day.
          </p>
        </section>
      </main>

      <Footer />
    </>
  );
}
