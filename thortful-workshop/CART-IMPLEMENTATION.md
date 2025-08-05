# Cart Implementation with Elastic Path

This document explains the cart implementation using the Elastic Path Commerce Cloud SDK.

## Overview

The cart implementation provides a complete shopping cart experience with:
- Real-time cart state management
- Add/update/remove items functionality
- Promotion code support
- Automatic cart persistence
- SSR compatibility

## Architecture

### Cart Service (`/src/app/services/cart.service.ts`)

The cart service manages all cart operations and state:

```typescript
interface CartState {
  cart: CartResponse | null;
  items: CartItemsObjectResponse[];
  loading: boolean;
  error: string | null;
}
```

Key features:
- Uses RxJS for reactive state management
- Provides observables for cart data, items, totals, and item count
- Handles authentication token refresh automatically
- Platform-aware (works with SSR)

### Cart Component (`/src/app/components/cart/cart.component.ts`)

The cart component displays cart contents and handles user interactions:
- Shows cart items with images, prices, and quantities
- Allows quantity updates and item removal
- Displays order summary with subtotal, tax, discount, and total
- Includes promotion code functionality
- Provides test controls for development

## Usage

### Adding Items to Cart

From any component, inject the CartService and use:

```typescript
await this.cartService.addToCart(productId, quantity);
```

### Updating Item Quantity

```typescript
await this.cartService.updateItemQuantity(itemId, newQuantity);
```

### Removing Items

```typescript
await this.cartService.removeItem(itemId);
```

### Applying Promotion Codes

```typescript
await this.cartService.applyPromotionCode(promoCode);
```

## Cart Types

The implementation handles multiple cart item types from the SDK:
- `CartItemResponseObject` - Regular products
- `CustomItemResponseObject` - Custom items (e.g., gift cards)
- `SubscriptionItemResponseObject` - Subscription products
- `PromotionItemResponseObject` - Applied promotions

## Integration with Header

The header component displays the cart item count:
- Subscribes to `cartService.itemCount$`
- Updates automatically when items are added/removed
- Links to the cart page at `/cart`

## Testing

1. Navigate to `/cart` to view the cart page
2. Use the "Add Test Product" button to add items (requires valid product IDs)
3. Click "Add to Cart" on product cards from the home page
4. Test quantity updates, item removal, and promotion codes

## Notes

- Cart is automatically initialized on first use
- Cart ID is stored in localStorage for persistence
- All prices support multiple currencies
- Cart data includes tax calculations and discounts
- The implementation uses SDK types for type safety