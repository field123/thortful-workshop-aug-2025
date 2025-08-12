import Header from "./components/Header";
import HeroCarousel from "./components/HeroCarousel";
import TrustpilotWidget from "./components/TrustpilotWidget";
import ProductSection from "./components/ProductSection";
import Footer from "./components/Footer";
import Image from "next/image";
import Link from "next/link";
import AuthTest from "./components/AuthTest";
import { configureClient } from "../lib/api-client";

configureClient();

export default function Home() {
  const customerFavourites = [
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

  const birthdayByRecipient = [
    {
      href: "/cards/birthday/female",
      image:
        "https://images.thortful.com/card/664c6f49d799b553d03b1ad2/664c6f49d799b553d03b1ad2_medium.jpg?version=1",
      title: "Cards For Her",
    },
    {
      href: "/cards/birthday/male",
      image:
        "https://images.thortful.com/card/67e27d389ff08444982f3e53/67e27d389ff08444982f3e53_medium.jpg?version=1",
      title: "Cards For Him",
    },
    {
      href: "/cards/birthday/child",
      image:
        "https://images.thortful.com/card/672cb8430171cf52dfa87d87/672cb8430171cf52dfa87d87_medium.jpg?version=1",
      title: "Cards For Kids",
    },
    {
      href: "/cards/birthday/friend",
      image:
        "https://images.thortful.com/card/6033ed8a0c0d4e0001ff8926/6033ed8a0c0d4e0001ff8926_medium.jpg?version=1",
      title: "Cards For Friend",
    },
  ];

  const giftingRange = [
    {
      href: "/gifts?c=birthday&occasion=birthday",
      image:
        "https://strapi-media.thortful.com/cdn-cgi/image/width=250,format=auto,quality=90/Birthday_Badge_2_dbd804b1a6.jpg",
      title: "Birthday gifts",
    },
    {
      href: "/gifts?c=our-tonys-chocolonely-gifts&occasion=Birthday",
      image:
        "https://strapi-media.thortful.com/cdn-cgi/image/width=250,format=auto,quality=90/Tony_s_Homepage_7df590321d.jpg",
      title: "Tony's Chocolonely",
    },
    {
      href: "/gifts?c=flower-and-plants&occasion=Birthday",
      image:
        "https://strapi-media.thortful.com/cdn-cgi/image/width=250,format=auto,quality=90/Flowers_HP_Image_e768e4e595.jpg",
      title: "Flowers and Plants",
    },
    {
      href: "/gifts?c=wedding-and-engagement-gifts&occasion=wedding",
      image:
        "https://strapi-media.thortful.com/cdn-cgi/image/width=250,format=auto,quality=90/Prosecco_and_Box_3_5715aab1c4.jpg",
      title: "Wedding Gifts",
    },
  ];

  const birthdayByStyle = [
    {
      href: "/cards/birthday/funny",
      image:
        "https://images.thortful.com/card/62cc6e5626b5d40001e0db42/62cc6e5626b5d40001e0db42_medium.jpg?version=1",
      title: "Funny Cards",
    },
    {
      href: "/cards/birthday/rude",
      image:
        "https://images.thortful.com/card/5f9ae0da8849800001bf06f4/5f9ae0da8849800001bf06f4_medium.jpg?version=1",
      title: "Rude Cards",
    },
    {
      href: "/cards/birthday/cute",
      image:
        "https://images.thortful.com/card/660e8903d799b553d03afcd8/660e8903d799b553d03afcd8_medium.jpg?version=1",
      title: "Cute Cards",
    },
    {
      href: "/personalised-photo-cards/birthday",
      image:
        "https://images.thortful.com/card/65d76bcb3887ad144558f385/65d76bcb3887ad144558f385_medium.jpg?version=1",
      title: "Photo Cards",
    },
  ];

  return (
    <>
      <Header />

      <main>
        <HeroCarousel />
        <TrustpilotWidget />

        <AuthTest />

        <ProductSection
          title="Customer Favourites"
          products={customerFavourites}
        />

        <ProductSection
          title="Birthday by Recipient"
          viewAllLink="/cards/birthday"
          products={birthdayByRecipient}
        />

        <ProductSection
          title="Shop Our Gifting Range"
          viewAllLink="/gifts"
          viewAllText="Browse Gift Ideas"
          products={giftingRange}
        />

        <ProductSection
          title="Birthday by Style"
          viewAllLink="/cards/birthday"
          products={birthdayByStyle}
        />

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
