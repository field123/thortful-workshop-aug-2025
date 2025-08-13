"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import CartDropdown from './CartDropdown';
import styles from './Header.module.css';

interface HeaderProps {
  isAuthenticated?: boolean;
}

export default function Header({ isAuthenticated = false }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPlaceholder] = useState('Birthday card for a Gemini');

  return (
    <header className={styles.header}>
      {/* Top banner */}
      <div className={styles.topBanner}>
        <div className={styles.bannerContent}>
          <div className={styles.bannerItems}>
            <span className={styles.bannerItem}>4 for £10 on A5 Cards</span>
            <span className={styles.bannerItem}>2nd Class postage from 99p</span>
            <span className={styles.bannerItem}>Order before 6pm for same day dispatch (Mon-Fri excl bank holidays)</span>
          </div>
        </div>
      </div>

      {/* Mobile menu toggle (hidden checkbox) */}
      <input type="checkbox" id="mobile-menu-toggle" className={styles.mobileMenuToggle} />
      
      {/* Mobile header */}
      <div className={styles.mobileHeader}>
        <div className={styles.mobileTopRow}>
          {/* Hamburger menu */}
          <label htmlFor="mobile-menu-toggle" className={styles.hamburger}>
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
          </label>

          {/* Logo */}
          <Link href="/" className={styles.mobileLogo}>
            <Image
              src="/thortful-logo.svg"
              alt="thortful orange logo"
              width={100}
              height={28}
              className={styles.mobileLogoImage}
              priority
            />
          </Link>

          {/* Right icons */}
          <div className={styles.mobileIcons}>
            <Link href={isAuthenticated ? "/account" : "/login"}>
              <Image src="/user-icon.svg" alt="thortful account icon" width={20} height={20} />
            </Link>
            <CartDropdown />
          </div>
        </div>

        {/* Mobile search bar */}
        <div className={styles.mobileSearchContainer}>
          <div style={{ position: 'relative' }}>
            <Image
              src="/search-icon.svg"
              alt=""
              width={20}
              height={20}
              className={styles.mobileSearchIcon}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className={styles.mobileSearchInput}
            />
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <nav className={styles.mobileMenu}>
        <div style={{ padding: '20px' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '20px' }}>
              <Link href="/cards/birthday" style={{ fontSize: '18px', color: 'black', textDecoration: 'none' }}>
                Birthday
              </Link>
            </li>
            <li style={{ marginBottom: '20px' }}>
              <Link href="/cards/anniversary" style={{ fontSize: '18px', color: 'black', textDecoration: 'none' }}>
                Anniversary
              </Link>
            </li>
            <li style={{ marginBottom: '20px' }}>
              <Link href="/cards" style={{ fontSize: '18px', color: 'black', textDecoration: 'none' }}>
                Card & Gift
              </Link>
            </li>
            <li style={{ marginBottom: '20px' }}>
              <Link href="/personalised-cards" style={{ fontSize: '18px', color: 'black', textDecoration: 'none' }}>
                Personalised Cards
              </Link>
            </li>
            <li style={{ marginBottom: '20px' }}>
              <Link href="/cards" style={{ fontSize: '18px', color: 'black', textDecoration: 'none' }}>
                All Occasions
              </Link>
            </li>
            <li style={{ marginBottom: '20px' }}>
              <Link href="/creators/list" style={{ fontSize: '18px', color: 'black', textDecoration: 'none' }}>
                Our Creators
              </Link>
            </li>
            <li style={{ marginBottom: '20px' }}>
              <Link href="/refer-a-friend" style={{ fontSize: '18px', color: '#f57c00', textDecoration: 'none' }}>
                Get £5 Off
              </Link>
            </li>
          </ul>
          
          <hr style={{ margin: '30px 0', borderColor: '#e5e5e5' }} />
          
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '15px' }}>
              <Link href="#" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'black', textDecoration: 'none' }}>
                <Image src="/calendar-icon.svg" alt="Reminders" width={20} height={20} />
                Reminders
              </Link>
            </li>
            <li style={{ marginBottom: '15px' }}>
              <Link href="#" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'black', textDecoration: 'none' }}>
                <Image src="/heart-icon.svg" alt="Saved" width={20} height={20} />
                Saved
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Overlay */}
      <label htmlFor="mobile-menu-toggle" className={styles.overlay}></label>

      {/* Desktop navigation */}
      <nav className={styles.mainNav}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <Image
            src="/thortful-logo.svg"
            alt="thortful orange logo"
            width={151}
            height={43}
            className={styles.logoImage}
            priority
          />
        </Link>

        {/* Search bar */}
        <div className={styles.searchContainer}>
          <Image
            src="/search-icon.svg"
            alt=""
            width={20}
            height={20}
            className={styles.searchIcon}
          />
          {!searchQuery && (
            <div className={styles.searchPlaceholder}>
              {searchPlaceholder}
            </div>
          )}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* Right navigation */}
        <ul className={styles.rightNav}>
          <li className={styles.navItem}>
            <Link 
              href={isAuthenticated ? "/account" : "/login"} 
              className={styles.navLink}
            >
              <Image src="/user-icon.svg" alt="thortful account icon" width={20} height={20} />
              <span className={styles.navText}>
                {isAuthenticated ? 'Account' : 'Sign in'}
              </span>
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link href="#" className={styles.navLink}>
              <Image src="/calendar-icon.svg" alt="thortful reminders icon" width={20} height={20} />
              <span className={styles.navText}>Reminders</span>
            </Link>
          </li>
          <li className={styles.navItem}>
            <button className={styles.navLink} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <Image src="/heart-icon.svg" alt="thortful favourite cards icon" width={20} height={20} />
              <span className={styles.navText}>Saved</span>
            </button>
          </li>
          <li className={styles.navItem}>
            <CartDropdown />
          </li>
        </ul>
      </nav>

      {/* Category navigation */}
      <nav className={styles.categoryNav}>
        <div className={styles.categoryContainer}>
          <ul className={styles.categoryList}>
            <li className={styles.categoryItem}>
              <Link href="/cards/birthday" className={styles.categoryLink}>
                Birthday
              </Link>
            </li>
            <li className={styles.categoryItem}>
              <Link href="/cards/anniversary" className={styles.categoryLink}>
                Anniversary
              </Link>
            </li>
            <li className={styles.categoryItem}>
              <Link href="/cards" className={styles.categoryLink}>
                Card & Gift
              </Link>
            </li>
            <li className={styles.categoryItem}>
              <Link href="/personalised-cards" className={styles.categoryLink}>
                Personalised Cards
              </Link>
            </li>
            <li className={styles.categoryItem}>
              <Link href="/cards" className={styles.categoryLink}>
                All Occasions
              </Link>
            </li>
            <li className={styles.categoryItem}>
              <Link href="/creators/list" className={styles.categoryLink}>
                Our Creators
              </Link>
            </li>
            <li className={styles.categoryItem}>
              <Link href="/refer-a-friend" className={`${styles.categoryLink} ${styles.categoryHighlight}`}>
                Get £5 Off
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}