import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { type CartIncluded } from '@epcc-sdk/sdks-shopper';

type CartItem = NonNullable<CartIncluded['items']>[number];

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent {
  cartService = inject(CartService);
  promoCode = '';

  getItemId(item: CartItem): string {
    return 'id' in item && item.id ? item.id : '';
  }

  getItemName(item: CartItem): string {
    if ('name' in item && item.name) return item.name;
    if ('title' in item && item.title && typeof item.title === 'string') return item.title;
    return 'Item';
  }

  getItemDescription(item: CartItem): string | null {
    if ('description' in item && item.description) return item.description;
    return null;
  }

  getItemType(item: CartItem): string {
    return 'type' in item && item.type ? item.type : '';
  }

  getItemQuantity(item: CartItem): number | undefined {
    if ('quantity' in item && typeof item.quantity === 'number') {
      return item.quantity;
    }
    return undefined;
  }

  getItemPrice(item: CartItem): string {
    if ('meta' in item && item.meta?.display_price?.with_tax) {
      const withTax = item.meta.display_price.with_tax as any;
      if (withTax.unit?.formatted) {
        return withTax.unit.formatted;
      }
    }
    return '$0.00';
  }

  getItemTotal(item: CartItem): string {
    if ('meta' in item && item.meta?.display_price?.with_tax) {
      const withTax = item.meta.display_price.with_tax as any;
      if (withTax.value?.formatted) {
        return withTax.value.formatted;
      }
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