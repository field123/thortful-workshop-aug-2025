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
  paymentId: string | null = null;

  async ngOnInit() {
    // Get order ID and client secret from query params
    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(async params => {
      this.orderId = params['orderId'];
      this.clientSecret = params['clientSecret'];
      this.paymentId = params['paymentId'];
      
      if (!this.orderId || !this.clientSecret || !this.paymentId) {
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
      // Submit the payment to Stripe
      const { error, paymentIntent } = await this.stripe.confirmPayment({
        elements: this.elements,
        redirect: 'if_required'
      });

      if (error) {
        // Show error to customer
        this.error = error.message || 'Payment failed';
        this.loading = false;
        return;
      }

      // Payment succeeded with Stripe, now confirm with Elastic Path
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        try {
          await this.checkoutService.confirmElasticPathPayment(this.orderId!, this.paymentId!);
          
          // Clear cart and redirect to success
          localStorage.removeItem('ep_cart_id');
          await this.router.navigate(['/checkout/success'], {
            queryParams: { orderId: this.orderId }
          });
        } catch (epError: any) {
          console.error('Failed to confirm payment with Elastic Path:', epError);
          this.error = 'Payment processed but order confirmation failed. Please contact support.';
          this.loading = false;
        }
      } else {
        // Payment requires additional action
        this.error = 'Payment requires additional verification';
        this.loading = false;
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      this.error = 'An unexpected error occurred';
      this.loading = false;
    }
  }

  cancel() {
    this.router.navigate(['/checkout']);
  }
}