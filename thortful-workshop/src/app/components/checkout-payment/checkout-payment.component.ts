import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { loadStripe } from '@stripe/stripe-js';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CheckoutService } from '../../services/checkout.service';

@Component({
  selector: 'app-checkout-payment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout-payment.component.html',
  styleUrl: './checkout-payment.component.css'
})
export class CheckoutPaymentComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private checkoutService = inject(CheckoutService);
  
  private destroy$ = new Subject<void>();
  
  stripe: any = null;
  elements: any = null;
  paymentElement: any = null;
  
  loading = true;
  error: string | null = null;
  orderId: string | null = null;
  clientSecret: string | null = null;

  async ngOnInit() {
    // Get order ID and client secret from query params
    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(async params => {
      this.orderId = params['orderId'];
      this.clientSecret = params['clientSecret'];
      
      if (!this.orderId || !this.clientSecret) {
        this.error = 'Invalid payment session';
        this.loading = false;
        return;
      }
      
      await this.initializeStripe();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.paymentElement) {
      this.paymentElement.destroy();
    }
  }

  private async initializeStripe() {
    try {
      const stripePublishableKey = environment.stripe?.publishableKey || 'pk_test_51234567890';
      this.stripe = await loadStripe(stripePublishableKey);
      
      if (!this.stripe) {
        throw new Error('Failed to load Stripe');
      }

      // Create elements with client secret
      const elementsOptions: any = {
        clientSecret: this.clientSecret
      };
      
      // Add Stripe Connect account if configured
      const stripeAccountId = environment.stripe?.connectAccountId;
      if (stripeAccountId && stripeAccountId !== 'acct_1234567890') {
        elementsOptions.stripeAccount = stripeAccountId;
      }
      
      this.elements = this.stripe.elements(elementsOptions);
      this.paymentElement = this.elements.create('payment', {
        layout: 'tabs'
      });

      // Mount payment element
      setTimeout(() => {
        const paymentElementContainer = document.getElementById('payment-element');
        if (paymentElementContainer) {
          this.paymentElement.mount(paymentElementContainer);
        }
        this.loading = false;
      }, 0);
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
      this.error = 'Failed to load payment form';
      this.loading = false;
    }
  }

  async handleSubmit() {
    if (!this.stripe || !this.elements) {
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      // Submit the payment
      const { error } = await this.stripe.confirmPayment({
        elements: this.elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`
        }
      });

      if (error) {
        // Show error to customer
        this.error = error.message || 'Payment failed';
        this.loading = false;
      }
      // Payment succeeded - Stripe will redirect to success page
    } catch (error: any) {
      this.error = 'An unexpected error occurred';
      this.loading = false;
    }
  }

  cancel() {
    this.router.navigate(['/checkout']);
  }
}