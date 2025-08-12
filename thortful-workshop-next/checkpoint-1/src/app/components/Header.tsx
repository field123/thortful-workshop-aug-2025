"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchPlaceholder] = useState("Birthday card for a Gemini");

  return (
    <header className="bg-white">
      {/* Top banner */}
      <div className="bg-[#f57c00] text-white h-[50px] flex items-center overflow-hidden">
        <div className="animate-slide-left whitespace-nowrap flex">
          <span
            className="inline-block px-6"
            style={{ fontSize: "17.6px", lineHeight: "17.6px" }}
          >
            4 for £10 on A5 Cards
          </span>
          <span
            className="inline-block px-6"
            style={{ fontSize: "17.6px", lineHeight: "17.6px" }}
          >
            2nd Class postage from 99p
          </span>
          <span
            className="inline-block px-6"
            style={{ fontSize: "17.6px", lineHeight: "17.6px" }}
          >
            Order before 6pm for same day dispatch (Mon-Fri excl bank holidays)
          </span>
          <span
            className="inline-block px-6"
            style={{ fontSize: "17.6px", lineHeight: "17.6px" }}
          >
            4 for £10 on A5 Cards
          </span>
          <span
            className="inline-block px-6"
            style={{ fontSize: "17.6px", lineHeight: "17.6px" }}
          >
            2nd Class postage from 99p
          </span>
          <span
            className="inline-block px-6"
            style={{ fontSize: "17.6px", lineHeight: "17.6px" }}
          >
            Order before 6pm for same day dispatch (Mon-Fri excl bank holidays)
          </span>
        </div>
      </div>

      {/* Main navigation */}
      <nav
        className="flex items-center justify-between px-[15px] max-w-[1200px] mx-auto"
        style={{ height: "94px", padding: "20px 0" }}
      >
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
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <Image
              src="/search-icon.svg"
              alt=""
              width={20}
              height={20}
              className="opacity-50"
            />
          </div>
          {!searchQuery && (
            <div
              className="absolute left-12 top-1/2 -translate-y-1/2 text-[#999] pointer-events-none"
              style={{ fontSize: "16px" }}
            >
              {searchPlaceholder}
            </div>
          )}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-[30px] border-2 border-transparent focus:border-[#f57c00] focus:outline-none
                     focus:bg-white transition-all"
            style={{
              height: "50px",
              backgroundColor: "rgb(241, 241, 242)",
              fontSize: "16px",
              paddingLeft: "50px",
              paddingRight: "50px",
            }}
            style={{ caretColor: "#f57c00" }}
          />
        </div>

        {/* Right navigation */}
        <ul className="flex items-center gap-0">
          <li>
            <button className="flex items-center gap-1 px-3 py-2 hover:text-[#f57c00] transition-colors">
              <Image
                src="/user-icon.svg"
                alt="thortful sign in icon"
                width={20}
                height={20}
              />
              <span style={{ fontSize: "13px" }}>Sign in</span>
            </button>
          </li>
          <li>
            <Link
              href="#"
              className="flex items-center gap-1 px-3 py-2 hover:text-[#f57c00] transition-colors"
            >
              <Image
                src="/calendar-icon.svg"
                alt="thortful reminders icon"
                width={20}
                height={20}
              />
              <span style={{ fontSize: "13px" }}>Reminders</span>
            </Link>
          </li>
          <li>
            <button className="flex items-center gap-1 px-3 py-2 hover:text-[#f57c00] transition-colors">
              <Image
                src="/heart-icon.svg"
                alt="thortful favourite cards icon"
                width={20}
                height={20}
              />
              <span style={{ fontSize: "13px" }}>Saved</span>
            </button>
          </li>
          <li>
            <Link
              href="/cart"
              className="flex items-center gap-1 px-3 py-2 hover:text-[#f57c00] transition-colors"
            >
              <Image
                src="/basket-icon.svg"
                alt="thortful basket icon"
                width={20}
                height={20}
              />
              <span style={{ fontSize: "13px" }}>Basket</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Category navigation */}
      <nav
        className="border-t border-gray-200 bg-white"
        style={{ height: "39px" }}
      >
        <div className="max-w-[1200px] mx-auto">
          <ul
            className="flex items-center px-[15px]"
            style={{ height: "25px", lineHeight: "25px" }}
          >
            <li style={{ paddingRight: "20px", display: "inline-block" }}>
              <Link
                href="/cards/birthday"
                className="hover:text-[#f57c00] transition-colors"
                style={{
                  fontSize: "16px",
                  fontWeight: "500",
                  padding: "0 4px",
                }}
              >
                Birthday
              </Link>
            </li>
            <li style={{ paddingRight: "20px", display: "inline-block" }}>
              <Link
                href="/cards/anniversary"
                className="hover:text-[#f57c00] transition-colors"
                style={{
                  fontSize: "16px",
                  fontWeight: "500",
                  padding: "0 4px",
                }}
              >
                Anniversary
              </Link>
            </li>
            <li style={{ paddingRight: "20px", display: "inline-block" }}>
              <Link
                href="/cards"
                className="hover:text-[#f57c00] transition-colors"
                style={{
                  fontSize: "16px",
                  fontWeight: "500",
                  padding: "0 4px",
                }}
              >
                Card & Gift
              </Link>
            </li>
            <li style={{ paddingRight: "20px", display: "inline-block" }}>
              <Link
                href="/personalised-cards"
                className="hover:text-[#f57c00] transition-colors"
                style={{
                  fontSize: "16px",
                  fontWeight: "500",
                  padding: "0 4px",
                }}
              >
                Personalised Cards
              </Link>
            </li>
            <li style={{ paddingRight: "20px", display: "inline-block" }}>
              <Link
                href="/cards"
                className="hover:text-[#f57c00] transition-colors"
                style={{
                  fontSize: "16px",
                  fontWeight: "500",
                  padding: "0 4px",
                }}
              >
                All Occasions
              </Link>
            </li>
            <li style={{ paddingRight: "20px", display: "inline-block" }}>
              <Link
                href="/creators/list"
                className="hover:text-[#f57c00] transition-colors"
                style={{
                  fontSize: "16px",
                  fontWeight: "500",
                  padding: "0 4px",
                }}
              >
                Our Creators
              </Link>
            </li>
            <li style={{ paddingRight: "20px", display: "inline-block" }}>
              <Link
                href="/refer-a-friend"
                className="text-[#f57c00] hover:text-[#ef6c00] transition-colors"
                style={{
                  fontSize: "16px",
                  fontWeight: "500",
                  padding: "0 4px",
                }}
              >
                Get £5 Off
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
