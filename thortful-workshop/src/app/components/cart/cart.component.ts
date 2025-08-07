import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { type CartItemsObjectResponse } from '@epcc-sdk/sdks-shopper';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="cart-container">
      <h2>Shopping Cart</h2>

      <div *ngIf="(cartService.loading$ | async)" class="loading">
        Loading cart...
      </div>

      <div *ngIf="(cartService.error$ | async) as error" class="error">
        {{ error }}
      </div>

      <div *ngIf="!(cartService.loading$ | async)" class="cart-content">
        <div class="cart-items">
          <h3>Items ({{ cartService.itemCount$ | async }})</h3>

          <div *ngIf="(cartService.items$ | async)?.length === 0" class="empty-cart">
            Your cart is empty
          </div>

          <ng-container *ngFor="let item of (cartService.items$ | async)">
          <div class="cart-item" *ngIf="isCartItem(item)">
            <div class="item-image" *ngIf="hasImage(item)">
              <img [src]="getImage(item)?.href" [alt]="item.name">
            </div>

            <div class="item-details">
              <h4>{{ item.name }}</h4>
              <p class="sku" *ngIf="hasSku(item)">SKU: {{ getSku(item) }}</p>
              <p class="price">{{ getUnitPrice(item) }}</p>
            </div>

            <div class="item-quantity">
              <button (click)="updateQuantity(item.id || '', getQuantity(item) - 1)"
                      [disabled]="getQuantity(item) <= 1">-</button>
              <span>{{ getQuantity(item) }}</span>
              <button (click)="updateQuantity(item.id || '', getQuantity(item) + 1)">+</button>
            </div>

            <div class="item-total">
              {{ getTotalPrice(item) }}
            </div>

            <button class="remove-btn" (click)="removeItem(item.id || '')">Remove</button>
          </div>
          </ng-container>
        </div>

        <div class="cart-summary">
          <h3>Order Summary</h3>

          <div class="totals" *ngIf="(cartService.totals$ | async) as totals">
            <div class="total-line">
              <span>Subtotal:</span>
              <span>{{ totals.subtotal }}</span>
            </div>

            <div class="total-line" *ngIf="totals.hasDiscount">
              <span>Discount:</span>
              <span class="discount">{{ totals.discount }}</span>
            </div>

            <div class="total-line" *ngIf="totals.shipping !== '$0.00'">
              <span>Shipping:</span>
              <span>{{ totals.shipping }}</span>
            </div>

            <div class="total-line">
              <span>Tax:</span>
              <span>{{ totals.tax }}</span>
            </div>

            <div class="total-line total">
              <span>Total:</span>
              <span>{{ totals.total }}</span>
            </div>
          </div>

          <div class="promo-code">
            <h4>Promo Code</h4>
            <div class="promo-input">
              <input type="text"
                     [(ngModel)]="promoCode"
                     placeholder="Enter promo code"
                     (keyup.enter)="applyPromoCode()">
              <button (click)="applyPromoCode()" [disabled]="!promoCode">Apply</button>
            </div>
          </div>

          <button class="checkout-btn"
                  [disabled]="(cartService.itemCount$ | async) === 0">
            Proceed to Checkout
          </button>
        </div>
      </div>

      <div class="test-section">
        <h3>Test Cart Operations</h3>
        <div class="test-actions">
          <button (click)="addTestProduct()">Add Test Product</button>
          <button (click)="clearCart()">Clear Cart</button>
          <button (click)="refreshCart()">Refresh Cart</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cart-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .loading, .error {
      padding: 20px;
      text-align: center;
    }

    .error {
      color: #dc3545;
    }

    .cart-content {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 40px;
      margin-top: 20px;
    }

    .cart-items {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
    }

    .empty-cart {
      padding: 40px;
      text-align: center;
      color: #6c757d;
    }

    .cart-item {
      display: grid;
      grid-template-columns: 100px 1fr auto auto auto;
      gap: 20px;
      align-items: center;
      padding: 20px;
      background: white;
      margin-bottom: 10px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .item-image img {
      width: 100%;
      height: 100px;
      object-fit: cover;
      border-radius: 4px;
    }

    .item-details h4 {
      margin: 0 0 5px 0;
    }

    .item-details p {
      margin: 0;
      color: #6c757d;
    }

    .item-quantity {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .item-quantity button {
      width: 30px;
      height: 30px;
      border: 1px solid #ddd;
      background: white;
      cursor: pointer;
      border-radius: 4px;
    }

    .item-quantity button:hover:not(:disabled) {
      background: #f8f9fa;
    }

    .item-quantity button:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .item-total {
      font-weight: 600;
    }

    .remove-btn {
      background: none;
      border: none;
      color: #dc3545;
      cursor: pointer;
      text-decoration: underline;
    }

    .cart-summary {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      height: fit-content;
      position: sticky;
      top: 20px;
    }

    .cart-summary h3 {
      margin-top: 0;
    }

    .totals {
      margin: 20px 0;
    }

    .total-line {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e9ecef;
    }

    .total-line.total {
      font-size: 1.2em;
      font-weight: 600;
      border-bottom: none;
      border-top: 2px solid #dee2e6;
      margin-top: 10px;
      padding-top: 15px;
    }

    .discount {
      color: #28a745;
    }

    .promo-code {
      margin: 20px 0;
    }

    .promo-code h4 {
      margin-bottom: 10px;
    }

    .promo-input {
      display: flex;
      gap: 10px;
    }

    .promo-input input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .promo-input button {
      padding: 8px 20px;
      background: #6c757d;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .promo-input button:hover:not(:disabled) {
      background: #5a6268;
    }

    .promo-input button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .checkout-btn {
      width: 100%;
      padding: 15px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1.1em;
      cursor: pointer;
    }

    .checkout-btn:hover:not(:disabled) {
      background: #0056b3;
    }

    .checkout-btn:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }

    .test-section {
      margin-top: 40px;
      padding: 20px;
      background: #e9ecef;
      border-radius: 8px;
    }

    .test-actions {
      display: flex;
      gap: 10px;
      margin-top: 10px;
    }

    .test-actions button {
      padding: 10px 20px;
      border: 1px solid #6c757d;
      background: white;
      border-radius: 4px;
      cursor: pointer;
    }

    .test-actions button:hover {
      background: #f8f9fa;
    }

    @media (max-width: 768px) {
      .cart-content {
        grid-template-columns: 1fr;
      }

      .cart-item {
        grid-template-columns: 1fr;
        gap: 10px;
      }

      .item-image {
        display: none;
      }

      .cart-summary {
        position: static;
      }
    }
  `]
})
export class CartComponent {
  cartService = inject(CartService);
  promoCode = '';

  isCartItem(item: CartItemsObjectResponse): boolean {
    return item.type === 'cart_item' || item.type === 'custom_item';
  }

  hasImage(item: CartItemsObjectResponse): boolean {
    return 'image' in item && !!item.image;
  }

  getImage(item: CartItemsObjectResponse): any {
    return 'image' in item ? item.image : null;
  }

  hasSku(item: CartItemsObjectResponse): boolean {
    return 'sku' in item;
  }

  getSku(item: CartItemsObjectResponse): string {
    return 'sku' in item && item.sku ? item.sku : '';
  }

  getQuantity(item: CartItemsObjectResponse): number {
    return 'quantity' in item ? item.quantity : 1;
  }

  getUnitPrice(item: CartItemsObjectResponse): string {
    if ('meta' in item && item.meta?.display_price?.with_tax) {
      const withTax = item.meta.display_price.with_tax as any;
      if (withTax.unit?.formatted) {
        return withTax.unit.formatted;
      }
    }
    if ('unit_price' in item && item.unit_price?.amount) {
      return `$${(item.unit_price.amount / 100).toFixed(2)}`;
    }
    return '$0.00';
  }

  getTotalPrice(item: CartItemsObjectResponse): string {
    if ('meta' in item && item.meta?.display_price?.with_tax) {
      const withTax = item.meta.display_price.with_tax as any;
      if (withTax.value?.formatted) {
        return withTax.value.formatted;
      }
    }
    if ('value' in item && item.value?.amount) {
      return `$${(item.value.amount / 100).toFixed(2)}`;
    }
    return '$0.00';
  }

  async updateQuantity(itemId: string, quantity: number) {
    if (quantity < 1) return;

    try {
      await this.cartService.updateItemQuantity(itemId, quantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  }

  async removeItem(itemId: string) {
    if (confirm('Are you sure you want to remove this item?')) {
      try {
        await this.cartService.removeItem(itemId);
      } catch (error) {
        console.error('Failed to remove item:', error);
      }
    }
  }

  async applyPromoCode() {
    if (!this.promoCode.trim()) return;

    try {
      await this.cartService.applyPromotionCode(this.promoCode);
      this.promoCode = '';
    } catch (error) {
      console.error('Failed to apply promo code:', error);
      alert('Invalid promo code');
    }
  }

  async addTestProduct() {
    const testProductId = prompt('Enter a product ID to add to cart:');
    if (!testProductId) return;

    try {
      await this.cartService.addToCart(testProductId, 1);
      alert('Product added to cart!');
    } catch (error) {
      console.error('Failed to add product:', error);
      alert('Failed to add product. Make sure the product ID is valid.');
    }
  }

  async clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
      try {
        await this.cartService.clearCart();
      } catch (error) {
        console.error('Failed to clear cart:', error);
      }
    }
  }

  async refreshCart() {
    try {
      await this.cartService.fetchCart();
    } catch (error) {
      console.error('Failed to refresh cart:', error);
    }
  }
}
