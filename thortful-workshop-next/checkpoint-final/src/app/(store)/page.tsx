import HeroCarousel from '../components/HeroCarousel';
import TrustpilotWidget from '../components/TrustpilotWidget';
import ProductSection from '../components/ProductSection';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const customerFavourites = [
    {
      href: '#',
      image: 'https://images.thortful.com/card/669a344810eebe054a811c80/669a344810eebe054a811c80_medium.jpg?version=1',
      title: 'Birthday Cards',
      showPlaceholder: true
    },
    {
      href: '#',
      image: 'https://images.thortful.com/card/62cd3f165026790001d8be9f/62cd3f165026790001d8be9f_medium.jpg?version=1',
      title: 'Anniversary Cards',
      showPlaceholder: true
    },
    {
      href: '#',
      image: 'https://strapi-media.thortful.com/cdn-cgi/image/width=250,format=auto,quality=90/First_Image_Birthday_Pack_9_Cheeky_ab5c6da632.jpg',
      title: 'Card Packs',
      showPlaceholder: false
    },
    {
      href: '#',
      image: 'https://images.thortful.com/card/643eaf15d982cd2234ed9b2a/643eaf15d982cd2234ed9b2a_medium.jpg?version=1',
      title: 'Congratulations Cards',
      showPlaceholder: true
    }
  ];

  const birthdayByRecipient = [
    {
      href: '#',
      image: 'https://images.thortful.com/card/664c6f49d799b553d03b1ad2/664c6f49d799b553d03b1ad2_medium.jpg?version=1',
      title: 'Cards For Her'
    },
    {
      href: '#',
      image: 'https://images.thortful.com/card/67e27d389ff08444982f3e53/67e27d389ff08444982f3e53_medium.jpg?version=1',
      title: 'Cards For Him'
    },
    {
      href: '#',
      image: 'https://images.thortful.com/card/672cb8430171cf52dfa87d87/672cb8430171cf52dfa87d87_medium.jpg?version=1',
      title: 'Cards For Kids'
    },
    {
      href: '#',
      image: 'https://images.thortful.com/card/6033ed8a0c0d4e0001ff8926/6033ed8a0c0d4e0001ff8926_medium.jpg?version=1',
      title: 'Cards For Friend'
    }
  ];

  const giftingRange = [
    {
      href: '#',
      image: 'https://strapi-media.thortful.com/cdn-cgi/image/width=250,format=auto,quality=90/Birthday_Badge_2_dbd804b1a6.jpg',
      title: 'Birthday gifts'
    },
    {
      href: '#',
      image: 'https://strapi-media.thortful.com/cdn-cgi/image/width=250,format=auto,quality=90/Tony_s_Homepage_7df590321d.jpg',
      title: "Tony's Chocolonely"
    },
    {
      href: '#',
      image: 'https://strapi-media.thortful.com/cdn-cgi/image/width=250,format=auto,quality=90/Flowers_HP_Image_e768e4e595.jpg',
      title: 'Flowers and Plants'
    },
    {
      href: '#',
      image: 'https://strapi-media.thortful.com/cdn-cgi/image/width=250,format=auto,quality=90/Prosecco_and_Box_3_5715aab1c4.jpg',
      title: 'Wedding Gifts'
    }
  ];

  const birthdayByStyle = [
    {
      href: '#',
      image: 'https://images.thortful.com/card/62cc6e5626b5d40001e0db42/62cc6e5626b5d40001e0db42_medium.jpg?version=1',
      title: 'Funny Cards'
    },
    {
      href: '#',
      image: 'https://images.thortful.com/card/5f9ae0da8849800001bf06f4/5f9ae0da8849800001bf06f4_medium.jpg?version=1',
      title: 'Rude Cards'
    },
    {
      href: '#',
      image: 'https://images.thortful.com/card/660e8903d799b553d03afcd8/660e8903d799b553d03afcd8_medium.jpg?version=1',
      title: 'Cute Cards'
    },
    {
      href: '#',
      image: 'https://images.thortful.com/card/65d76bcb3887ad144558f385/65d76bcb3887ad144558f385_medium.jpg?version=1',
      title: 'Photo Cards'
    }
  ];

  return (
    <main>
      <HeroCarousel />
      <TrustpilotWidget />
      
      <ProductSection
        title="Customer Favourites"
        products={customerFavourites}
        showPlaceholder={true}
      />
      
      <ProductSection
        title="Birthday by Recipient"
        viewAllLink="#"
        products={birthdayByRecipient}
        showPlaceholder={true}
      />
      
      <ProductSection
        title="Shop Our Gifting Range"
        viewAllLink="#"
        viewAllText="Browse Gift Ideas"
        products={giftingRange}
        showPlaceholder={false}
      />
      
      <ProductSection
        title="Birthday by Style"
        viewAllLink="#"
        products={birthdayByStyle}
        showPlaceholder={true}
      />

      {/* SEO content */}
      <section className="max-w-[1200px] mx-auto px-[15px] py-12 text-center">
        <h1 className="text-3xl font-bold mb-6">
          The UK's First Online Greeting Card Marketplace
        </h1>
        <p className="text-gray-600 max-w-4xl mx-auto leading-relaxed">
          We are the largest online greeting cards marketplace, supported by a community of independent{' '}
          <span className="text-[#f57c00]">
            creators
          </span>
          , illustrators and photographers who are the master minds behind our truly unique card creations. 
          We have thousands of greeting cards for every occasion to choose from online, including{' '}
          <span className="text-[#f57c00]">
            Birthday cards
          </span>
          ,{' '}
          <span className="text-[#f57c00]">
            Kids Birthday cards
          </span>
          ,{' '}
          <span className="text-[#f57c00]">
            Anniversary cards
          </span>
          ,{' '}
          <span className="text-[#f57c00]">
            Personalised cards
          </span>
          {' '}
          <span className="text-[#f57c00]">
            Wedding cards
          </span>
          ,{' '}
          <span className="text-[#f57c00]">
            New Baby cards
          </span>
          {' '}and{' '}
          <span className="text-[#f57c00]">
            New Home cards
          </span>
          . And all of our cards are available with next day card delivery, for those last-minute moments - 
          just order before 6pm and your card will be dispatched the same day.
        </p>
      </section>
    </main>
  );
}