import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  checkoutApi,
  paymentSetup,
  confirmPayment,
  manageCarts,
  type CheckoutApiData,
  type PaymentSetupData,
} from '@epcc-sdk/sdks-shopper';
import { CartService } from './cart.service';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface CheckoutFormData {
  customer: {
    email: string;
    firstName: string;
    lastName: string;
  };
  billingAddress: {
    firstName: string;
    lastName: string;
    line1: string;
    line2?: string;
    city: string;
    region?: string;
    postcode: string;
    country: string;
  };
  shippingAddress: {
    firstName: string;
    lastName: string;
    line1: string;
    line2?: string;
    city: string;
    region?: string;
    postcode: string;
    country: string;
  };
  sameAsShipping: boolean;
}

interface CheckoutState {
  loading: boolean;
  error: string | null;
  orderId: string | null;
  paymentIntentClientSecret: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private cartService = inject(CartService);
  private authService = inject(AuthService);

  private checkoutStateSubject = new BehaviorSubject<CheckoutState>({
    loading: false,
    error: null,
    orderId: null,
    paymentIntentClientSecret: null
  });

  public checkoutState$ = this.checkoutStateSubject.asObservable();

  async processCheckout(formData: CheckoutFormData, requiresAccount: boolean): Promise<any> {
    try {
      this.updateState({ loading: true, error: null });

      const cartId = this.cartService.getCartId();
      if (!cartId) {
        throw new Error('No cart found');
      }

      // Convert cart to order
      const order = requiresAccount && this.authService.getCurrentTokens().accountToken
        ? await this.checkoutWithAccount(cartId, formData)
        : await this.checkoutAsGuest(cartId, formData);

      const orderId = order.data?.id;
      if (!orderId) {
        throw new Error('Failed to create order');
      }

      this.updateState({ orderId });

      // Initialize payment
      const payment = await this.initializePayment(orderId);
      const paymentId = payment.data?.id;
      const clientSecret = payment.data?.payment_intent?.client_secret;

      if (!paymentId || !clientSecret) {
        throw new Error('Failed to initialize payment');
      }

      this.updateState({ paymentIntentClientSecret: clientSecret });
      this.updateState({ loading: false });

      return {
        orderId,
        paymentId,
        clientSecret
      };
    } catch (error: any) {
      this.updateState({ 
        loading: false, 
        error: error.message || 'Checkout failed' 
      });
      throw error;
    }
  }


  private async checkoutAsGuest(
    cartId: string, 
    formData: CheckoutFormData
  ): Promise<any> {
    return await checkoutApi({
      path: { cartID: cartId },
      body: {
        data: {
          customer: {
            email: formData.customer.email,
            name: `${formData.customer.firstName} ${formData.customer.lastName}`
          },
          billing_address: {
            first_name: formData.billingAddress.firstName,
            last_name: formData.billingAddress.lastName,
            company_name: '',
            line_1: formData.billingAddress.line1,
            line_2: formData.billingAddress.line2 || '',
            city: formData.billingAddress.city,
            county: '',
            region: formData.billingAddress.region || '',
            postcode: formData.billingAddress.postcode,
            country: formData.billingAddress.country
          },
          shipping_address: formData.sameAsShipping ? {
            first_name: formData.billingAddress.firstName,
            last_name: formData.billingAddress.lastName,
            phone_number: '',
            company_name: '',
            line_1: formData.billingAddress.line1,
            line_2: formData.billingAddress.line2 || '',
            city: formData.billingAddress.city,
            county: '',
            region: formData.billingAddress.region || '',
            postcode: formData.billingAddress.postcode,
            country: formData.billingAddress.country,
            instructions: ''
          } : {
            first_name: formData.shippingAddress.firstName,
            last_name: formData.shippingAddress.lastName,
            phone_number: '',
            company_name: '',
            line_1: formData.shippingAddress.line1,
            line_2: formData.shippingAddress.line2 || '',
            city: formData.shippingAddress.city,
            county: '',
            region: formData.shippingAddress.region || '',
            postcode: formData.shippingAddress.postcode,
            country: formData.shippingAddress.country,
            instructions: ''
          }
        }
      }
    });
  }

  private async checkoutWithAccount(
    cartId: string, 
    formData: CheckoutFormData
  ): Promise<any> {
    // For subscriptions, we'll need to implement account creation/login
    // For now, we'll use guest checkout with a note that account is required
    throw new Error('Account checkout not implemented. Please implement account creation/login for subscriptions.');
    
    // When implemented, this would use checkoutApi with account data:
    // return await checkoutApi({
    //   path: { cartID: cartId },
    //   body: {
    //     data: {
    //       account: {
    //         id: accountId,
    //         member_id: memberId
    //       },
    //       contact: {
    //         name: `${formData.customer.firstName} ${formData.customer.lastName}`,
    //         email: formData.customer.email
    //       },
    //       billing_address: { ... },
    //       shipping_address: { ... }
    //     }
    //   }
    // });
  }

  private async initializePayment(orderId: string): Promise<any> {
    const paymentBody: PaymentSetupData['body'] = {
      data: {
        gateway: 'elastic_path_payments_stripe' as any, // Cast to any since the type doesn't include this gateway yet
        method: 'purchase',
        payment_method_types: ['card']
      } as any
    };

    // Add Stripe Connect account if configured
    const stripeAccountId = environment.stripe?.connectAccountId;
    if (stripeAccountId && stripeAccountId !== 'acct_1234567890') {
      paymentBody.data = {
        ...paymentBody.data,
        options: {
          stripe_account: stripeAccountId
        }
      } as any;
    }

    return await paymentSetup({
      path: { orderID: orderId },
      body: paymentBody
    });
  }

  async confirmElasticPathPayment(
    orderId: string, 
    transactionId: string
  ): Promise<any> {
    return await confirmPayment({
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
  }

  private updateState(patch: Partial<CheckoutState>): void {
    this.checkoutStateSubject.next({
      ...this.checkoutStateSubject.getValue(),
      ...patch
    });
  }

  public resetCheckout(): void {
    this.checkoutStateSubject.next({
      loading: false,
      error: null,
      orderId: null,
      paymentIntentClientSecret: null
    });
  }
}