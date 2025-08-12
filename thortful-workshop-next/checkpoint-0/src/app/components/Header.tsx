"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPlaceholder] = useState('Birthday card for a Gemini');

  return (
    <header className="bg-white">
      {/* Top banner */}
      <div className="bg-black text-white h-[50px] flex items-center">
        <div className="w-full flex justify-center">
          <div className="flex items-center divide-x divide-white/30">
            <span className="px-6" style={{ fontSize: '17.6px', lineHeight: '50px' }}>4 for £10 on A5 Cards</span>
            <span className="px-6" style={{ fontSize: '17.6px', lineHeight: '50px' }}>2nd Class postage from 99p</span>
            <span className="px-6" style={{ fontSize: '17.6px', lineHeight: '50px' }}>Order before 6pm for same day dispatch (Mon-Fri excl bank holidays)</span>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="flex items-center justify-between max-w-[1200px] mx-auto" style={{ height: '94px', padding: '20px 15px' }}>
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/thortful-logo.svg"
            alt="thortful orange logo"
            width={151}
            height={43}
            className="w-[151px] h-[43px]"
            priority
          />
        </Link>

        {/* Search bar */}
        <div className="relative flex-1 max-w-[725px] mx-[15px]">
          <Image
            src="/search-icon.svg"
            alt=""
            width={20}
            height={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50"
          />
          {!searchQuery && (
            <div className="absolute left-12 top-1/2 -translate-y-1/2 text-[#999] pointer-events-none" style={{ fontSize: '16px' }}>
              {searchPlaceholder}
            </div>
          )}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-[30px] border-2 border-transparent focus:border-[#f57c00] focus:outline-none
                     focus:bg-white transition-all"
            style={{ height: '50px', backgroundColor: 'rgb(241, 241, 242)', fontSize: '16px', paddingLeft: '50px', paddingRight: '50px', caretColor: '#f57c00' }}
          />
        </div>

        {/* Right navigation */}
        <ul className="flex items-center gap-0">
          <li>
            <button className="flex items-center gap-1 px-3 py-2 hover:text-[#f57c00] transition-colors">
              <Image src="/user-icon.svg" alt="thortful sign in icon" width={20} height={20} />
              <span style={{ fontSize: '13px', fontFamily: 'Roboto, Arial, Helvetica, sans-serif' }}>Sign in</span>
            </button>
          </li>
          <li>
            <Link href="#" className="flex items-center gap-1 px-3 py-2 hover:text-[#f57c00] transition-colors">
              <Image src="/calendar-icon.svg" alt="thortful reminders icon" width={20} height={20} />
              <span style={{ fontSize: '13px', fontFamily: 'Roboto, Arial, Helvetica, sans-serif' }}>Reminders</span>
            </Link>
          </li>
          <li>
            <button className="flex items-center gap-1 px-3 py-2 hover:text-[#f57c00] transition-colors">
              <Image src="/heart-icon.svg" alt="thortful favourite cards icon" width={20} height={20} />
              <span style={{ fontSize: '13px', fontFamily: 'Roboto, Arial, Helvetica, sans-serif' }}>Saved</span>
            </button>
          </li>
          <li>
            <button className="flex items-center gap-1 px-3 py-2 hover:text-[#f57c00] transition-colors">
              <Image src="/basket-icon.svg" alt="thortful basket icon" width={20} height={20} />
              <span style={{ fontSize: '13px', fontFamily: 'Roboto, Arial, Helvetica, sans-serif' }}>Basket</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Category navigation */}
      <nav className="bg-white" style={{ borderTop: '1px solid #e5e5e5', borderBottom: '1px solid #e5e5e5', height: '39px' }}>
        <div className="max-w-[1200px] mx-auto">
          <ul className="flex items-center px-[15px]" style={{ height: '39px' }}>
            <li style={{ paddingRight: '20px', display: 'inline-block' }}>
              <Link href="/cards/birthday" className="text-black hover:text-[#f57c00] transition-colors" style={{ fontSize: '16px', fontWeight: '500', padding: '0 4px', lineHeight: '24.96px' }}>
                Birthday
              </Link>
            </li>
            <li style={{ paddingRight: '20px', display: 'inline-block' }}>
              <Link href="/cards/anniversary" className="text-black hover:text-[#f57c00] transition-colors" style={{ fontSize: '16px', fontWeight: '500', padding: '0 4px', lineHeight: '24.96px' }}>
                Anniversary
              </Link>
            </li>
            <li style={{ paddingRight: '20px', display: 'inline-block' }}>
              <Link href="/cards" className="text-black hover:text-[#f57c00] transition-colors" style={{ fontSize: '16px', fontWeight: '500', padding: '0 4px', lineHeight: '24.96px' }}>
                Card & Gift
              </Link>
            </li>
            <li style={{ paddingRight: '20px', display: 'inline-block' }}>
              <Link href="/personalised-cards" className="text-black hover:text-[#f57c00] transition-colors" style={{ fontSize: '16px', fontWeight: '500', padding: '0 4px', lineHeight: '24.96px' }}>
                Personalised Cards
              </Link>
            </li>
            <li style={{ paddingRight: '20px', display: 'inline-block' }}>
              <Link href="/cards" className="text-black hover:text-[#f57c00] transition-colors" style={{ fontSize: '16px', fontWeight: '500', padding: '0 4px', lineHeight: '24.96px' }}>
                All Occasions
              </Link>
            </li>
            <li style={{ paddingRight: '20px', display: 'inline-block' }}>
              <Link href="/creators/list" className="text-black hover:text-[#f57c00] transition-colors" style={{ fontSize: '16px', fontWeight: '500', padding: '0 4px', lineHeight: '24.96px' }}>
                Our Creators
              </Link>
            </li>
            <li className="ml-auto" style={{ paddingRight: '0', display: 'block' }}>
              <Link href="/refer-a-friend" className="text-[#f57c00] hover:text-[#ef6c00] transition-colors" style={{ fontSize: '16px', fontWeight: '500', padding: '0 4px', lineHeight: '24.96px' }}>
                Get £5 Off
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}