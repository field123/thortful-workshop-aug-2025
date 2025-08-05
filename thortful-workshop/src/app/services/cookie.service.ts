import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class CookieService {
  private platformId = inject(PLATFORM_ID);

  setCookie(name: string, value: string, options?: {
    expires?: Date;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
    httpOnly?: boolean;
  }): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (options?.expires) {
      cookieString += `; expires=${options.expires.toUTCString()}`;
    }

    if (options?.path) {
      cookieString += `; path=${options.path}`;
    } else {
      cookieString += '; path=/';
    }

    if (options?.domain) {
      cookieString += `; domain=${options.domain}`;
    }

    // Only add secure flag if explicitly true or if on HTTPS
    if (options?.secure === true && window.location.protocol === 'https:') {
      cookieString += '; secure';
    }

    if (options?.sameSite) {
      cookieString += `; samesite=${options.sameSite}`;
    } else {
      cookieString += '; samesite=lax';
    }

    document.cookie = cookieString;
  }

  getCookie(name: string): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const nameEQ = encodeURIComponent(name) + '=';
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(nameEQ)) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }

    return null;
  }

  deleteCookie(name: string, path?: string, domain?: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    let cookieString = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
    
    if (path) {
      cookieString += `; path=${path}`;
    } else {
      cookieString += '; path=/';
    }

    if (domain) {
      cookieString += `; domain=${domain}`;
    }

    document.cookie = cookieString;
  }

  // Parse cookies from a cookie string (useful for SSR)
  parseCookieString(cookieString: string): { [key: string]: string } {
    const cookies: { [key: string]: string } = {};
    
    if (!cookieString) {
      return cookies;
    }

    const pairs = cookieString.split(';');
    
    for (let pair of pairs) {
      pair = pair.trim();
      const [name, value] = pair.split('=');
      
      if (name && value) {
        cookies[decodeURIComponent(name)] = decodeURIComponent(value);
      }
    }

    return cookies;
  }
}