import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { CartComponent } from './components/cart/cart.component';
import { MembershipComponent } from './components/membership/membership.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', redirectTo: '', pathMatch: 'full' },
  { path: 'cart', component: CartComponent },
  { path: 'plus', component: MembershipComponent }
];