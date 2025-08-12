import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  checkoutApi,
  paymentSetup,
  confirmPayment,
  type OrderResponse,
} from '@epcc-sdk/sdks-shopper';
import { CartService } from './cart.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private cartService = inject(CartService);

  async createOrderFromCart(checkoutData: any): Promise<OrderResponse> {
    const cartId = this.cartService.getCartId();
    if (!cartId) {
      throw new Error('No cart found');
    }

    try {
      const response = await checkoutApi({
        path: { cartID: cartId },
        body: {
          data: checkoutData
        }
      });

      if (response.error) {
        throw new Error((response.error as any).message || 'Checkout failed');
      }

      return response.data as OrderResponse;
    } catch (error: any) {
      console.error('Checkout error:', error);
      throw error;
    }
  }

  async setupPayment(orderId: string): Promise<any> {
    try {
      const response = await paymentSetup({
        path: { orderID: orderId },
        body: {
          data: {
            gateway: 'elastic_path_payments_stripe' as any,
            method: 'purchase'
          } as any
        }
      });

      if (response.error) {
        throw new Error((response.error as any).message || 'Payment setup failed');
      }

      return response.data;
    } catch (error: any) {
      console.error('Payment setup error:', error);
      throw error;
    }
  }

  async setupPaymentWithToken(orderId: string, confirmationTokenId: string): Promise<any> {
    console.log('Setting up payment with confirmation token:', confirmationTokenId);
    console.log('Order ID:', orderId);
    
    // For now, just log the token
    // In a real implementation, this would send the token to Elastic Path
    return {
      id: 'mock-transaction-id',
      status: 'pending',
      confirmation_token_id: confirmationTokenId
    };
  }

  async confirmElasticPathPayment(orderId: string, transactionId: string): Promise<any> {
    try {
      const response = await confirmPayment({
        path: {
          orderID: orderId,
          transactionID: transactionId
        },
        body: {
          data: {
            options: {}
          }
        }
      });

      if (response.error) {
        throw new Error((response.error as any).message || 'Payment confirmation failed');
      }

      return response.data;
    } catch (error: any) {
      console.error('Payment confirmation error:', error);
      throw error;
    }
  }
}