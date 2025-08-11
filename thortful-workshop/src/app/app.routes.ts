import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { CartComponent } from './components/cart/cart.component';
import { MembershipComponent } from './components/membership/membership.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { CheckoutPaymentComponent } from './components/checkout-payment/checkout-payment.component';
import { CheckoutSuccessComponent } from './components/checkout-success/checkout-success.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', redirectTo: '', pathMatch: 'full' },
  { path: 'cart', component: CartComponent },
  { path: 'plus', component: MembershipComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'checkout/payment', component: CheckoutPaymentComponent },
  { path: 'checkout/success', component: CheckoutSuccessComponent }
];