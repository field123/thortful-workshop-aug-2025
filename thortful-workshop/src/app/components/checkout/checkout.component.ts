import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CheckoutService } from '../../services/checkout.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  cartService = inject(CartService);
  checkoutService = inject(CheckoutService);
  
  checkoutForm: FormGroup;
  loading = false;
  error: string | null = null;

  constructor() {
    this.checkoutForm = this.fb.group({
      customer: this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        name: ['', Validators.required]
      }),
      billingAddress: this.fb.group({
        first_name: ['', Validators.required],
        last_name: ['', Validators.required],
        line_1: ['', Validators.required],
        line_2: [''],
        city: ['', Validators.required],
        region: [''],
        postcode: ['', Validators.required],
        country: ['US', Validators.required]
      })
    });
  }

  ngOnInit() {
    // Pre-fill billing name from customer name
    this.checkoutForm.get('customer.name')?.valueChanges.subscribe(name => {
      if (name) {
        const [firstName, ...lastNameParts] = name.split(' ');
        const lastName = lastNameParts.join(' ');
        this.checkoutForm.patchValue({
          billingAddress: {
            first_name: firstName || '',
            last_name: lastName || ''
          }
        }, { emitEvent: false });
      }
    });
  }

  async onSubmit() {
    if (this.checkoutForm.invalid) {
      this.markFormGroupTouched(this.checkoutForm);
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      const formValue = this.checkoutForm.value;

      // Store checkout data in session storage to use on payment page
      const checkoutData = {
        customer: {
          email: formValue.customer.email,
          name: formValue.customer.name
        },
        billing_address: {
          ...formValue.billingAddress,
          company_name: '',
          county: '',
          phone_number: ''
        },
        shipping_address: {
          ...formValue.billingAddress,
          company_name: '',
          county: '',
          phone_number: '',
          instructions: ''
        }
      };
      
      // Store the checkout data for the payment page
      sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));
      
      // Navigate to payment page without creating order yet
      await this.router.navigate(['/checkout/payment']);
      
    } catch (error: any) {
      console.error('Checkout failed:', error);
      this.error = error.message || 'Failed to proceed to payment.';
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
    }
    return '';
  }

  // Helper methods for cart
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