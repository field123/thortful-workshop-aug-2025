import { Injectable, signal, inject, PLATFORM_ID, TransferState, makeStateKey } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { client, createAnAccessToken } from '@epcc-sdk/sdks-shopper';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthTokens {
  implicitToken?: string;
  implicitTokenExpiry?: number;
  accountToken?: string;
}

// Transfer state keys for SSR
const AUTH_TOKENS_KEY = makeStateKey<AuthTokens>('authTokens');
const AUTH_STATE_KEY = makeStateKey<boolean>('isAuthenticated');

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly IMPLICIT_TOKEN_KEY = 'ep_implicit_token';
  private readonly IMPLICIT_TOKEN_EXPIRY_KEY = 'ep_implicit_token_expiry';
  private readonly ACCOUNT_TOKEN_KEY = 'ep_account_token';
  private readonly CLIENT_ID = environment.elasticPath.clientId;
  private readonly BASE_URL = environment.elasticPath.endpointUrl;

  private platformId = inject(PLATFORM_ID);
  private transferState = inject(TransferState);
  
  private tokensSubject = new BehaviorSubject<AuthTokens>({});
  public tokens$ = this.tokensSubject.asObservable();

  private isAuthenticatedSignal = signal(false);
  public isAuthenticated = this.isAuthenticatedSignal.asReadonly();
  
  // For server-side cookie access
  private serverCookies: { [key: string]: string } = {};

  constructor() {
    this.configureSDK();
    this.initializeTokens();
    this.setupInterceptors();
  }

  private configureSDK(): void {
    client.setConfig({
      baseUrl: this.BASE_URL,
    });
  }

  private initializeTokens(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Browser: Check transfer state first, then localStorage
      const transferredTokens = this.transferState.get(AUTH_TOKENS_KEY, null);
      const transferredAuthState = this.transferState.get(AUTH_STATE_KEY, false);
      
      if (transferredTokens) {
        // Use tokens from SSR
        this.tokensSubject.next(transferredTokens);
        this.isAuthenticatedSignal.set(transferredAuthState);
        
        // Store transferred tokens in localStorage
        if (transferredTokens.implicitToken) {
          localStorage.setItem(this.IMPLICIT_TOKEN_KEY, transferredTokens.implicitToken);
          if (transferredTokens.implicitTokenExpiry) {
            localStorage.setItem(this.IMPLICIT_TOKEN_EXPIRY_KEY, transferredTokens.implicitTokenExpiry.toString());
          }
        }
        if (transferredTokens.accountToken) {
          localStorage.setItem(this.ACCOUNT_TOKEN_KEY, transferredTokens.accountToken);
        }
      } else {
        // Load from localStorage
        this.loadStoredTokens();
      }
    } else if (isPlatformServer(this.platformId)) {
      // Server: Load from cookies and prepare transfer state
      this.loadServerTokens();
    }
  }

  private setupInterceptors(): void {
    client.interceptors.request.use(async (config) => {
      const tokens = this.tokensSubject.getValue();
      
      if (tokens.implicitToken) {
        config.headers.set('Authorization', `Bearer ${tokens.implicitToken}`);
      }
      
      if (tokens.accountToken) {
        config.headers.set('EP-Account-Management-Authentication-Token', tokens.accountToken);
      }
      
      return config;
    });
  }

  private loadStoredTokens(): void {
    if (isPlatformBrowser(this.platformId)) {
      const implicitToken = localStorage.getItem(this.IMPLICIT_TOKEN_KEY);
      const implicitTokenExpiry = localStorage.getItem(this.IMPLICIT_TOKEN_EXPIRY_KEY);
      const accountToken = localStorage.getItem(this.ACCOUNT_TOKEN_KEY);

      const tokens: AuthTokens = {};
      
      if (implicitToken) {
        tokens.implicitToken = implicitToken;
      }
      
      if (implicitTokenExpiry) {
        tokens.implicitTokenExpiry = parseInt(implicitTokenExpiry);
      }
      
      if (accountToken) {
        tokens.accountToken = accountToken;
      }

      this.tokensSubject.next(tokens);
      this.isAuthenticatedSignal.set(!!implicitToken && !this.isImplicitTokenExpired());
    }
  }

  private loadServerTokens(): void {
    // On server, tokens should be provided via cookies
    const tokens: AuthTokens = {};
    
    if (this.serverCookies[this.IMPLICIT_TOKEN_KEY]) {
      tokens.implicitToken = this.serverCookies[this.IMPLICIT_TOKEN_KEY];
    }
    
    if (this.serverCookies[this.IMPLICIT_TOKEN_EXPIRY_KEY]) {
      tokens.implicitTokenExpiry = parseInt(this.serverCookies[this.IMPLICIT_TOKEN_EXPIRY_KEY]);
    }
    
    if (this.serverCookies[this.ACCOUNT_TOKEN_KEY]) {
      tokens.accountToken = this.serverCookies[this.ACCOUNT_TOKEN_KEY];
    }

    this.tokensSubject.next(tokens);
    const isAuth = !!tokens.implicitToken && !this.isImplicitTokenExpired();
    this.isAuthenticatedSignal.set(isAuth);
    
    // Store in transfer state for client
    this.transferState.set(AUTH_TOKENS_KEY, tokens);
    this.transferState.set(AUTH_STATE_KEY, isAuth);
  }

  // Method to set server cookies (called from server.ts)
  public setServerCookies(cookies: { [key: string]: string }): void {
    if (isPlatformServer(this.platformId)) {
      this.serverCookies = cookies;
      this.loadServerTokens();
    }
  }

  private isImplicitTokenExpired(): boolean {
    const tokens = this.tokensSubject.getValue();
    if (!tokens.implicitTokenExpiry) return true;
    
    // Add 30 second buffer for network latency
    return Date.now() > tokens.implicitTokenExpiry - 30000;
  }

  public async generateImplicitToken(): Promise<void> {
    try {
      const response = await createAnAccessToken({
        body: {
          grant_type: 'implicit',
          client_id: this.CLIENT_ID,
        },
      });

      const responseData = response.data;
      
      if (!responseData || !responseData.access_token) {
        throw new Error('Failed to generate access token');
      }

      const expiryTime = Date.now() + ((responseData.expires_in || 3600) * 1000);
      
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(this.IMPLICIT_TOKEN_KEY, responseData.access_token);
        localStorage.setItem(this.IMPLICIT_TOKEN_EXPIRY_KEY, expiryTime.toString());
      }

      const currentTokens = this.tokensSubject.getValue();
      this.tokensSubject.next({
        ...currentTokens,
        implicitToken: responseData.access_token,
        implicitTokenExpiry: expiryTime,
      });
      
      this.isAuthenticatedSignal.set(true);
    } catch (error) {
      console.error('Failed to generate implicit token:', error);
      throw error;
    }
  }

  public async ensureValidToken(): Promise<void> {
    if (!this.tokensSubject.getValue().implicitToken || this.isImplicitTokenExpired()) {
      await this.generateImplicitToken();
    }
  }

  public setAccountToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.ACCOUNT_TOKEN_KEY, token);
    }
    
    const currentTokens = this.tokensSubject.getValue();
    this.tokensSubject.next({
      ...currentTokens,
      accountToken: token,
    });
  }

  public clearTokens(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.IMPLICIT_TOKEN_KEY);
      localStorage.removeItem(this.IMPLICIT_TOKEN_EXPIRY_KEY);
      localStorage.removeItem(this.ACCOUNT_TOKEN_KEY);
    }
    
    this.tokensSubject.next({});
    this.isAuthenticatedSignal.set(false);
  }

  public getClientId(): string {
    return this.CLIENT_ID;
  }

  public getBaseUrl(): string {
    return this.BASE_URL;
  }

  // Get current tokens for cookie setting
  public getCurrentTokens(): AuthTokens {
    return this.tokensSubject.getValue();
  }
}