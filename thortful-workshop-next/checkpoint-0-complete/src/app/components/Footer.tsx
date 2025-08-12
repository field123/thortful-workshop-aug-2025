"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [openSections, setOpenSections] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const footerSections = [
    {
      title: 'discover',
      links: [
        { href: '/cards/Birthday', text: 'Birthday' },
        { href: '/cards/Anniversary', text: 'Anniversary' },
        { href: '/cards', text: 'All Cards' },
        { href: '/postcards', text: 'Postcards' },
      ]
    },
    {
      title: 'Get Help',
      links: [
        { href: '/help/customer-faqs', text: 'Customer FAQs' },
        { href: '/info/help/delivery', text: 'Delivery & Returns' },
        { href: '/info/help/contact-us', text: 'Contact Us' },
      ]
    },
    {
      title: 'creators',
      links: [
        { href: '/create/creators', text: 'Become a creator' },
        { href: '/help/creator-faqs', text: 'Creator FAQs' },
        { href: '/create/creators-guide', text: "Creator's guide" },
        { href: 'https://www.thortful.com/blog/creator-central/', text: 'Creator Central blog' },
      ]
    },
    {
      title: 'company',
      links: [
        { href: '/info/company/about-us', text: 'About Us' },
        { href: '/info/company/careers', text: 'Careers' },
        { href: '/business', text: 'Business Enquiries' },
        { href: 'https://www.thortful.com/blog', text: 'The thortful Blog' },
        { href: 'https://www.thortful.com/blog/thortful-affiliate-partner-programme/', text: 'Affiliate Programme' },
        { href: 'https://www.thortful.com/blog/thortful-discounts-offers-and-promo-codes/', text: 'Promotions' },
      ]
    },
    {
      title: 'legal',
      links: [
        { href: '/info/legal/terms-of-use', text: 'Terms of Use' },
        { href: '/info/legal/privacy-policy', text: 'Privacy Policy' },
        { href: '/info/legal/cookie-policy', text: 'Cookie Policy' },
      ]
    },
  ];

  return (
    <footer className="bg-[#f5f5f5] mt-8">
      {/* Newsletter section */}
      <div className="bg-[#f57c00] text-white py-10">
        <div className="max-w-[1200px] mx-auto px-[15px] text-center">
          <h3 className="text-2xl font-bold mb-2">Emails worth opening. (Promise.)</h3>
          <p className="mb-6 text-lg">Sign up for cool cards, juicy offers, and relationship-saving reminders.</p>
          <form className="max-w-[500px] mx-auto flex gap-2">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-full px-5 py-3 text-black placeholder-gray-500 text-sm"
              required
            />
            <button
              type="submit"
              className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors text-sm font-medium whitespace-nowrap"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-[15px] py-10">
        {/* App download */}
        <div className="text-center mb-10">
          <h3 className="text-xl font-bold mb-4">Get the thortful app</h3>
          <div className="flex justify-center gap-2">
            <Link href="https://link-app.thortful.com/ztJf/r5x99olr" target="_blank" rel="noopener noreferrer">
              <Image
                src="/app-store-badge.svg"
                alt="Get the iOS app on the App Store"
                width={135}
                height={45}
                className="h-[45px] w-auto"
              />
            </Link>
            <Link href="https://link-app.thortful.com/ztJf/r5x99olr" target="_blank" rel="noopener noreferrer">
              <Image
                src="/google-play-badge.png"
                alt="Get the Android app"
                width={151}
                height={45}
                className="h-[45px] w-auto"
              />
            </Link>
          </div>
        </div>

        {/* Footer links */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-10">
          {footerSections.map((section) => (
            <div key={section.title}>
              <button
                className="w-full text-left font-medium mb-3 md:cursor-default flex items-center justify-between"
                onClick={() => toggleSection(section.title)}
              >
                <span className="text-sm">{section.title}</span>
                <svg
                  className={`w-4 h-4 md:hidden transition-transform ${
                    openSections.includes(section.title) ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <ul className={`space-y-2 ${
                openSections.includes(section.title) || 'hidden md:block'
              }`}>
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-xs text-gray-600 hover:text-[#f57c00] transition-colors"
                      target={link.href.startsWith('http') ? '_blank' : undefined}
                      rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social links */}
        <div className="text-center mb-8 border-t border-gray-300 pt-8">
          <h4 className="font-medium mb-4 text-sm">Follow us</h4>
          <div className="flex justify-center gap-3">
            <Link href="https://www.facebook.com/thortful" target="_blank" rel="noopener noreferrer" 
                  className="hover:opacity-70 transition-opacity">
              <Image src="/facebook-icon.svg" alt="Facebook logo" width={28} height={28} />
            </Link>
            <Link href="https://www.tiktok.com/@thortful" target="_blank" rel="noopener noreferrer"
                  className="hover:opacity-70 transition-opacity">
              <Image src="/tiktok-icon.svg" alt="TikTok logo" width={28} height={28} />
            </Link>
            <Link href="https://instagram.com/thortful" target="_blank" rel="noopener noreferrer"
                  className="hover:opacity-70 transition-opacity">
              <Image src="/instagram-icon.svg" alt="Instagram logo" width={28} height={28} />
            </Link>
            <Link href="https://www.linkedin.com/company/thortful" target="_blank" rel="noopener noreferrer"
                  className="hover:opacity-70 transition-opacity">
              <Image src="/linkedin-icon.svg" alt="LinkedIn logo" width={28} height={28} />
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-xs text-gray-600">
          <Image
            src="/thortful-logo.svg"
            alt="Thortful Logo"
            width={100}
            height={33}
            className="mx-auto mb-2 opacity-50"
          />
          <p>© thortful 2025. All rights reserved.</p>
          <p className="mt-1">v 2.2003</p>
          <button className="mt-2 text-[#f57c00] hover:underline">Help code</button>
        </div>
      </div>
    </footer>
  );
}