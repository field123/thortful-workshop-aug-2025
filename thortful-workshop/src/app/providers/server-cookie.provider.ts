import { APP_INITIALIZER, Provider, inject, Optional } from '@angular/core';
import { AuthService } from '../services/auth.service';

// Server-side provider to inject cookies into AuthService
export function initializeServerAuth(
  authService: AuthService,
  cookies: { [key: string]: string } | null
): () => void {
  return () => {
    if (cookies) {
      authService.setServerCookies(cookies);
    }
  };
}

export const SERVER_COOKIE_PROVIDER: Provider = {
  provide: APP_INITIALIZER,
  useFactory: (authService: AuthService, cookies: { [key: string]: string } | null) => 
    initializeServerAuth(authService, cookies),
  deps: [AuthService, [new Optional(), 'SERVER_REQUEST_COOKIES']],
  multi: true
};