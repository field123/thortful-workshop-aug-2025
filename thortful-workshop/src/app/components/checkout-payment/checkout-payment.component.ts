import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  StripeElementsDirective,
  StripePaymentElementComponent,
  NgxStripeModule,
  StripeService
} from 'ngx-stripe';
import {
  StripeElementsOptions,
  StripePaymentElementOptions
} from '@stripe/stripe-js';
import { CartService } from '../../services/cart.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-checkout-payment',
  standalone: true,
  imports: [CommonModule, NgxStripeModule],
  templateUrl: './checkout-payment.component.html',
  styleUrl: './checkout-payment.component.css'
})
export class CheckoutPaymentComponent implements OnInit {
  @ViewChild(StripeElementsDirective) elements!: StripeElementsDirective;
  @ViewChild(StripePaymentElementComponent) paymentElement!: StripePaymentElementComponent;

  private router = inject(Router);
  private cartService = inject(CartService);
  stripeService = inject(StripeService);

  elementsOptions: StripeElementsOptions = {
    locale: 'en'
  };

  paymentElementOptions: StripePaymentElementOptions = {
    layout: {
      type: 'tabs',
      defaultCollapsed: false,
      radios: false,
      spacedAccordionItems: false
    }
  };

  loading = true;
  processing = false;
  error: string | null = null;
  checkoutData: any = null;
  cartTotal: any = null;
  stripeElementsInstance: any = null;

  ngOnInit() {
    // Get checkout data from session storage
    const checkoutDataStr = sessionStorage.getItem('checkoutData');
    if (!checkoutDataStr) {
      this.error = 'No checkout data found. Please go back to checkout.';
      this.loading = false;
      return;
    }

    this.checkoutData = JSON.parse(checkoutDataStr);

    // Get cart totals
    this.cartService.totals$.subscribe(totals => {
      this.cartTotal = totals;
      if (totals) {
        this.initializeStripeElements(totals);
      }
    });
  }

  private initializeStripeElements(totals: any) {
    // Extract amount from the total string (e.g., "$19.99" -> 1999)
    const totalAmount = this.extractAmount(totals.total);

    // Update elements options with mode and amount
    this.elementsOptions = {
      locale: 'en',
      mode: 'payment' as const,
      amount: totalAmount,
      currency: 'gbp',
      appearance: {
        theme: 'stripe' as const
      }
    };

    // Add Stripe Connect account if configured
    const stripeAccountId = environment.stripe?.connectAccountId;
    if (stripeAccountId && stripeAccountId !== 'acct_1234567890') {
      (this.elementsOptions as any).stripeAccount = stripeAccountId;
    }

    this.loading = false;
  }

  private extractAmount(formattedPrice: string): number {
    // Remove currency symbol and convert to cents
    const price = formattedPrice.replace(/[^0-9.]/g, '');
    return Math.round(parseFloat(price) * 100);
  }

  onElementsReady(elements: any) {
    console.log('Stripe Elements ready:', elements);
    this.stripeElementsInstance = elements;
  }

  async handlePayment() {
    if (!this.stripeElementsInstance) {
      this.error = 'Payment form not initialized';
      return;
    }

    this.processing = true;
    this.error = null;

    try {
      // Step 1: Submit the elements to validate
      const submitResult = await this.stripeElementsInstance.submit();
      if (submitResult?.error) {
        throw new Error(submitResult.error.message || 'Submit failed');
      }

      // Step 2: Create confirmation token using the Stripe instance and elements
      const stripe = this.stripeService.getInstance();
      if (!stripe) {
        throw new Error('Stripe not initialized');
      }

      const tokenResult = await stripe.createConfirmationToken({
        elements: this.stripeElementsInstance
      });

      if (tokenResult.error) {
        throw new Error(tokenResult.error.message || 'Token creation failed');
      }

      const confirmationToken = tokenResult.confirmationToken;

      if (!confirmationToken) {
        throw new Error('Failed to create payment token');
      }

      // Step 3: Log the confirmation token
      console.log('=== Confirmation Token Created ===');
      console.log('Token ID:', confirmationToken.id);
      console.log('Token Object:', confirmationToken);
      console.log('Checkout Data:', this.checkoutData);
      console.log('Cart Total:', this.cartTotal);
      console.log('=================================');

      // Show success message
      this.processing = false;
      this.error = null;

      alert(`Confirmation token created successfully!\n\nToken ID: ${confirmationToken.id}\n\nCheck the console for full details.\n\nIn a real implementation, you would now:\n1. Send this token to your backend\n2. Create the order with Elastic Path\n3. Process the payment`);

    } catch (error: any) {
      console.error('Payment error:', error);
      this.error = error.message || 'Payment failed';
      this.processing = false;
    }
  }

  cancel() {
    this.router.navigate(['/checkout']);
  }
}
