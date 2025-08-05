import { APP_INITIALIZER, Provider, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './auth.service';
import { CookieService } from './cookie.service';

// Initialize authentication on app startup
export function initializeAuth(
  authService: AuthService,
  cookieService: CookieService,
  platformId: Object
): () => Promise<void> {
  return async () => {
    if (isPlatformBrowser(platformId)) {
      // Browser: Set up cookie sync FIRST before any token operations
      const syncCookies = (tokens: any) => {
        if (tokens.implicitToken) {
          const expiryDate = tokens.implicitTokenExpiry 
            ? new Date(tokens.implicitTokenExpiry)
            : new Date(Date.now() + 3600000); // 1 hour default
          
          cookieService.setCookie('ep_implicit_token', tokens.implicitToken, {
            expires: expiryDate,
            secure: window.location.protocol === 'https:',
            sameSite: 'Lax'
          });
          
          if (tokens.implicitTokenExpiry) {
            cookieService.setCookie('ep_implicit_token_expiry', tokens.implicitTokenExpiry.toString(), {
              expires: expiryDate,
              secure: window.location.protocol === 'https:',
              sameSite: 'Lax'
            });
          }
        } else {
          cookieService.deleteCookie('ep_implicit_token');
          cookieService.deleteCookie('ep_implicit_token_expiry');
        }
        
        if (tokens.accountToken) {
          cookieService.setCookie('ep_account_token', tokens.accountToken, {
            secure: window.location.protocol === 'https:',
            sameSite: 'Lax'
          });
        } else {
          cookieService.deleteCookie('ep_account_token');
        }
      };
      
      // Subscribe to token changes
      authService.tokens$.subscribe(syncCookies);
      
      // Sync existing tokens from localStorage if any
      const currentTokens = authService.getCurrentTokens();
      if (currentTokens.implicitToken) {
        syncCookies(currentTokens);
      }
      
      // Try to ensure valid token on startup
      try {
        await authService.ensureValidToken();
      } catch (error) {
        console.error('Failed to initialize auth token:', error);
      }
    }
  };
}

export const AUTH_INITIALIZER_PROVIDER: Provider = {
  provide: APP_INITIALIZER,
  useFactory: (authService: AuthService, cookieService: CookieService, platformId: Object) => 
    initializeAuth(authService, cookieService, platformId),
  deps: [AuthService, CookieService, PLATFORM_ID],
  multi: true
};