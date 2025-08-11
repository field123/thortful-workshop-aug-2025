import { Component, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { loadStripe } from '@stripe/stripe-js';
import { Subject, takeUntil } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { CheckoutService, type CheckoutFormData } from '../../services/checkout.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  cartService = inject(CartService);
  checkoutService = inject(CheckoutService);

  private destroy$ = new Subject<void>();
  
  checkoutForm: FormGroup;
  stripe: any = null;
  elements: any = null;
  paymentElement: any = null;
  
  loading = false;
  error: string | null = null;
  hasSubscription = false;
  requiresAccount = false;
  stripeInitialized = false;


  constructor() {
    this.checkoutForm = this.fb.group({
      customer: this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        firstName: ['', Validators.required],
        lastName: ['', Validators.required]
      }),
      account: this.fb.group({
        password: [''],
        confirmPassword: ['']
      }),
      billingAddress: this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        line1: ['', Validators.required],
        line2: [''],
        city: ['', Validators.required],
        region: [''],
        postcode: ['', Validators.required],
        country: ['', Validators.required]
      }),
      shippingAddress: this.fb.group({
        firstName: [''],
        lastName: [''],
        line1: [''],
        line2: [''],
        city: [''],
        region: [''],
        postcode: [''],
        country: ['']
      }),
      sameAsShipping: [true]
    });
  }

  async ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    // Check cart for subscriptions
    this.cartService.items$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(items => {
      this.hasSubscription = items?.some((item: any) => item.type === 'subscription_item') || false;
      this.requiresAccount = this.hasSubscription;
      
      // Update form validators if account is required
      if (this.requiresAccount) {
        this.checkoutForm.get('account.password')?.setValidators([
          Validators.required,
          Validators.minLength(8)
        ]);
        this.checkoutForm.get('account.confirmPassword')?.setValidators([
          Validators.required
        ]);
      }
    });

    // Initialize Stripe (but don't create elements yet - we need client secret first)
    try {
      // In production, use your actual Stripe publishable key
      const stripePublishableKey = environment.stripe?.publishableKey || 'pk_test_51234567890';
      this.stripe = await loadStripe(stripePublishableKey);
      
      if (!this.stripe) {
        throw new Error('Failed to load Stripe');
      }
      
      this.stripeInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
      this.error = 'Failed to load payment system';
    }

    // Handle same as shipping toggle
    this.checkoutForm.get('sameAsShipping')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(sameAsShipping => {
        const shippingGroup = this.checkoutForm.get('shippingAddress');
        if (sameAsShipping) {
          shippingGroup?.clearValidators();
          shippingGroup?.reset();
        } else {
          shippingGroup?.get('firstName')?.setValidators(Validators.required);
          shippingGroup?.get('lastName')?.setValidators(Validators.required);
          shippingGroup?.get('line1')?.setValidators(Validators.required);
          shippingGroup?.get('city')?.setValidators(Validators.required);
          shippingGroup?.get('postcode')?.setValidators(Validators.required);
          shippingGroup?.get('country')?.setValidators(Validators.required);
        }
        shippingGroup?.updateValueAndValidity();
      });

    // Pre-fill billing name from customer info
    this.checkoutForm.get('customer')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(customer => {
        if (customer.firstName && customer.lastName) {
          this.checkoutForm.patchValue({
            billingAddress: {
              firstName: customer.firstName,
              lastName: customer.lastName
            }
          }, { emitEvent: false });
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.paymentElement) {
      this.paymentElement.destroy();
    }
  }

  async onSubmit() {
    if (this.checkoutForm.invalid) {
      this.markFormGroupTouched(this.checkoutForm);
      return;
    }

    if (!this.stripeInitialized) {
      this.error = 'Payment system not initialized';
      return;
    }

    // Validate passwords match if account is required
    if (this.requiresAccount) {
      const password = this.checkoutForm.get('account.password')?.value;
      const confirmPassword = this.checkoutForm.get('account.confirmPassword')?.value;
      if (password !== confirmPassword) {
        this.error = 'Passwords do not match';
        return;
      }
    }

    this.loading = true;
    this.error = null;

    try {
      const formValue = this.checkoutForm.value;
      const checkoutData: CheckoutFormData = {
        customer: formValue.customer,
        billingAddress: formValue.billingAddress,
        shippingAddress: formValue.sameAsShipping 
          ? formValue.billingAddress 
          : formValue.shippingAddress,
        sameAsShipping: formValue.sameAsShipping
      };

      // If account is required, create account first (not implemented in this example)
      if (this.requiresAccount && formValue.account.password) {
        // In production, you would call an account creation service here
        console.log('Account creation would happen here');
      }

      // Process checkout
      const result = await this.checkoutService.processCheckout(checkoutData, this.requiresAccount);
      
      if (result.paymentId && result.clientSecret) {
        // Redirect to payment page with order details
        await this.router.navigate(['/checkout/payment'], {
          queryParams: {
            orderId: result.orderId,
            clientSecret: result.clientSecret,
            paymentId: result.paymentId
          }
        });
      } else {
        throw new Error('Failed to initialize payment');
      }
    } catch (error: any) {
      console.error('Checkout failed:', error);
      this.error = error.message || 'Checkout failed. Please try again.';
      this.loading = false;
    }
  }


  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  isFieldInvalid(fieldPath: string): boolean {
    const field = this.checkoutForm.get(fieldPath);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldPath: string): string {
    const field = this.checkoutForm.get(fieldPath);
    if (field?.errors) {
      if (field.errors['required']) return 'This field is required';
      if (field.errors['email']) return 'Invalid email address';
      if (field.errors['minlength']) return `Minimum length is ${field.errors['minlength'].requiredLength}`;
    }
    return '';
  }

  // Helper methods for cart items
  getItemId(item: any): string {
    return item?.id || '';
  }

  getItemName(item: any): string {
    if (item?.name) return item.name;
    if (item?.title && typeof item.title === 'string') return item.title;
    return 'Item';
  }

  getItemQuantity(item: any): number | undefined {
    if (item && 'quantity' in item && typeof item.quantity === 'number') {
      return item.quantity;
    }
    return undefined;
  }

  getItemTotal(item: any): string {
    if (item?.meta?.display_price?.with_tax?.value?.formatted) {
      return item.meta.display_price.with_tax.value.formatted;
    }
    return '$0.00';
  }
}