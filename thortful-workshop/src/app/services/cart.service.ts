import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, from, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import {
  initializeCart,
  getCartId,
  getACart,
  manageCarts,
  updateACartItem,
  deleteACartItem,
  deleteAPromotionViaPromotionCode,
  type CartResponse,
  type CartIncluded, type ManageCartsData,
} from '@epcc-sdk/sdks-shopper';
import { AuthService } from './auth.service';

interface CartState {
  cart: CartResponse | null;
  items: CartIncluded["items"];
  loading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private platformId = inject(PLATFORM_ID);
  private authService = inject(AuthService);

  private cartStateSubject = new BehaviorSubject<CartState>({
    cart: null,
    items: [],
    loading: false,
    error: null
  });

  public cartState$ = this.cartStateSubject.asObservable();

  public cart$ = this.cartState$.pipe(map(state => state.cart));
  public items$ = this.cartState$.pipe(map(state => state.items));
  public loading$ = this.cartState$.pipe(map(state => state.loading));
  public error$ = this.cartState$.pipe(map(state => state.error));

  public itemCount$ = this.items$.pipe(
    map(items => items?.reduce((sum, item) => {
      const quantity = 'quantity' in item ? item.quantity : 1;
      return sum + quantity;
    }, 0))
  );

  public totals$ = this.cart$.pipe(
    map(cart => ({
      subtotal: cart?.meta?.display_price?.without_discount?.formatted || '$0.00',
      discount: cart?.meta?.display_price?.discount?.formatted || '$0.00',
      tax: cart?.meta?.display_price?.tax?.formatted || '$0.00',
      shipping: cart?.meta?.display_price?.shipping?.formatted || '$0.00',
      total: cart?.meta?.display_price?.with_tax?.formatted || '$0.00',
      hasDiscount: (cart?.meta?.display_price?.discount?.amount || 0) < 0
    }))
  );

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeCart();
    }
  }

  private async initializeCart(): Promise<void> {
    try {
      this.updateState({ loading: true });

      await this.authService.ensureValidToken();

      const cartId = await initializeCart();

      await this.fetchCart();
    } catch (error) {
      console.error('Failed to initialize cart:', error);
      this.updateState({ error: 'Failed to initialize cart', loading: false });
    }
  }

  public async fetchCart(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      this.updateState({ loading: true });

      const cartId = getCartId();
      if (!cartId) {
        await this.initializeCart();
        return;
      }

      const response = await getACart({
        path: { cartID: cartId },
        query: { include: ['items', 'promotions', "tax_items", "custom_discounts"] }
      });

      const cart = response.data?.data;
      const included = response.data?.included;

      // Extract items from the included field
      const items = included?.items || [];

      this.updateState({
        cart: cart || null,
        items,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      this.updateState({ error: 'Failed to fetch cart', loading: false });
    }
  }

  public async addToCart(productId: string, quantity: number = 1, options?: {
    customInputs?: Record<string, string>;
    bundleConfiguration?: any;
    location?: string;
  }): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      this.updateState({ loading: true });

      await this.authService.ensureValidToken();

      const cartId = getCartId();
      if (!cartId) throw new Error('No cart found');

      const body: ManageCartsData["body"] = {
        data: {
          type: 'cart_item',
          id: productId,
          quantity,
          ...(options?.customInputs ? { custom_inputs: options.customInputs } : {}),
          ...(options?.bundleConfiguration ? { bundle_configuration: options.bundleConfiguration } : {}),
          ...(options?.location ? { location: options.location } : {})
        }
      };

      await manageCarts({
        path: { cartID: cartId },
        body
      });

      await this.fetchCart();
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      this.updateState({ error: 'Failed to add item to cart', loading: false });
      throw error;
    }
  }

  public async addSubscriptionToCart(offeringId: string, planId: string, pricingOptionId: string): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      this.updateState({ loading: true });

      await this.authService.ensureValidToken();

      const cartId = getCartId();
      if (!cartId) throw new Error('No cart found');

      const body: ManageCartsData["body"] = {
        data: {
          type: 'subscription_item' as const,
          quantity: 1,
          id: offeringId,
          subscription_configuration: {
            plan: planId,
            pricing_option: pricingOptionId
          }
        }
      };

      await manageCarts({
        path: { cartID: cartId },
        body
      });

      await this.fetchCart();
    } catch (error) {
      console.error('Failed to add subscription to cart:', error);
      this.updateState({ error: 'Failed to add subscription to cart', loading: false });
      throw error;
    }
  }

  public async updateItemQuantity(itemId: string, quantity: number): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      this.updateState({ loading: true });

      await this.authService.ensureValidToken();

      const cartId = getCartId();
      if (!cartId) throw new Error('No cart found');

      await updateACartItem({
        path: {
          cartID: cartId,
          cartitemID: itemId
        },
        body: {
          data: {
            id: itemId,
            quantity
          }
        }
      });

      await this.fetchCart();
    } catch (error) {
      console.error('Failed to update item quantity:', error);
      this.updateState({ error: 'Failed to update item quantity', loading: false });
      throw error;
    }
  }

  public async removeItem(itemId: string): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      this.updateState({ loading: true });

      await this.authService.ensureValidToken();

      const cartId = getCartId();
      if (!cartId) throw new Error('No cart found');

      await deleteACartItem({
        path: {
          cartID: cartId,
          cartitemID: itemId
        }
      });

      await this.fetchCart();
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      this.updateState({ error: 'Failed to remove item', loading: false });
      throw error;
    }
  }

  public async applyPromotionCode(code: string): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      this.updateState({ loading: true });

      await this.authService.ensureValidToken();

      const cartId = getCartId();
      if (!cartId) throw new Error('No cart found');

      await manageCarts({
        path: { cartID: cartId },
        body: {
          data: {
            type: 'promotion_item',
            code
          }
        }
      });

      await this.fetchCart();
    } catch (error) {
      console.error('Failed to apply promotion code:', error);
      this.updateState({ error: 'Failed to apply promotion code', loading: false });
      throw error;
    }
  }

  public async removePromotionCode(code: string): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      this.updateState({ loading: true });

      await this.authService.ensureValidToken();

      const cartId = getCartId();
      if (!cartId) throw new Error('No cart found');

      await deleteAPromotionViaPromotionCode({
        path: {
          cartID: cartId,
          promoCode: code
        }
      });

      await this.fetchCart();
    } catch (error) {
      console.error('Failed to remove promotion code:', error);
      this.updateState({ error: 'Failed to remove promotion code', loading: false });
      throw error;
    }
  }

  public async clearCart(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      this.updateState({ loading: true });

      const state = this.cartStateSubject.getValue();

      for (const item of state.items || []) {
        if ('id' in item && item.id) {
          await this.removeItem(item.id);
        }
      }

      await this.fetchCart();
    } catch (error) {
      console.error('Failed to clear cart:', error);
      this.updateState({ error: 'Failed to clear cart', loading: false });
      throw error;
    }
  }

  private updateState(patch: Partial<CartState>): void {
    this.cartStateSubject.next({
      ...this.cartStateSubject.getValue(),
      ...patch
    });
  }

  public getCartId(): string | null {
    return isPlatformBrowser(this.platformId) ? getCartId() : null;
  }
}
