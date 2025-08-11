import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MembershipService } from '../../services/membership.service';
import { OfferingService } from '../../services/offering.service';
import { CartService } from '../../services/cart.service';
import {
  getPlans,
  getPlanById,
  getPricingOptionsForPlan,
  getPlansForPricingOption,
  formatPrice,
  formatPriceForPricingOption,
  formatPricingOptionInterval
} from '../../helpers/offering.helpers';
import type { OfferingPlan, OfferingPricingOption } from '@epcc-sdk/sdks-shopper';

const OFFERING_ID = '5bae1137-59c7-409a-87d6-72023fa22b17';

@Component({
  selector: 'app-membership',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './membership.component.html',
  styleUrls: ['./membership.component.css']
})
export class MembershipComponent implements OnInit {
  private authService = inject(AuthService);
  private membershipService = inject(MembershipService);
  offeringService = inject(OfferingService);
  private cartService = inject(CartService);
  private router = inject(Router);

  showSignUpModal = signal(false);
  isProcessing = signal(false);
  errorMessage = signal('');
  selectedPlanId = signal<string | null>(null);
  selectedPricingOptionId = signal<string | null>(null);

  membershipStatus$ = this.membershipService.membershipStatus$;
  isAuthenticated = this.authService.isAuthenticated;
  offering$ = this.offeringService.offering$;
  offeringLoading$ = this.offeringService.loading$;
  offeringError$ = this.offeringService.error$;

  plan = this.membershipService.getCurrentPlan();

  benefits = [
    {
      icon: '🎁',
      title: 'First card (and postage) free!',
      description: 'Start sending joy instantly with your first standard sized card and 1st Class delivery.'
    },
    {
      icon: '💳',
      title: '30% off all cards',
      description: 'Spread joy without breaking the bank - always save 30% for any occasion'
    },
    {
      icon: '📮',
      title: 'Free postcard every month',
      description: 'Spreading joy to those that mean the most to you is easy.'
    },
    {
      icon: '🎉',
      title: '50% off selected cards',
      description: 'Save 50% off a selection of 100+ cards - from standard to giant!'
    },
    {
      icon: '📦',
      title: 'Multi-buy cards discount',
      description: 'Save 40% when you buy 5+ cards within the same order!'
    },
    {
      icon: '📏',
      title: 'All sizes included',
      description: 'Your 30% off is redeemable on all card sizes – from standard to giant!'
    },
    {
      icon: '🌍',
      title: 'Global perks',
      description: 'Your benefits are available to use across our international sites.'
    },
    {
      icon: '🎊',
      title: 'Surprise perks',
      description: 'Receive fun and fanciful perks throughout the year. Keep your eyes peeled!'
    }
  ];

  testimonials = [
    {
      stars: 5,
      text: 'Thortful Plus is worth every penny',
      author: 'Sarah M.'
    },
    {
      stars: 5,
      text: 'Great products and recommend Thortful Plus',
      author: 'John D.'
    }
  ];

  async ngOnInit() {
    // Fetch the offering data
    await this.offeringService.fetchOffering(OFFERING_ID);

    // Initialize with the first plan and its first pricing option
    const offering = this.offeringService.offering$();
    const plans = getPlans(offering);
    if (plans.length > 0) {
      const firstPlan = plans[0];
      if (firstPlan.id) {
        this.selectedPlanId.set(firstPlan.id);

        // Get pricing options for this plan
        const pricingOptions = getPricingOptionsForPlan(offering, firstPlan);
        if (pricingOptions.length > 0 && pricingOptions[0].id) {
          this.selectedPricingOptionId.set(pricingOptions[0].id);
        }
      }
    }
  }

  getSelectedPlan(): OfferingPlan | undefined {
    const planId = this.selectedPlanId();
    if (!planId) return undefined;
    const offering = this.offeringService.offering$();
    return getPlanById(offering, planId);
  }

  getSelectedPricingOption(): OfferingPricingOption | undefined {
    const plan = this.getSelectedPlan();
    const pricingOptionId = this.selectedPricingOptionId();
    if (!plan || !pricingOptionId) return undefined;

    const offering = this.offeringService.offering$();
    const pricingOptions = getPricingOptionsForPlan(offering, plan);
    return pricingOptions.find(option => option.id === pricingOptionId);
  }

  getAllUniquePricingOptions(): OfferingPricingOption[] {
    const offering = this.offeringService.offering$();
    const plans = getPlans(offering);
    const pricingOptionsMap = new Map<string, OfferingPricingOption>();

    plans.forEach(plan => {
      const pricingOptions = getPricingOptionsForPlan(offering, plan);
      pricingOptions.forEach(option => {
        if (option.id && !pricingOptionsMap.has(option.id)) {
          pricingOptionsMap.set(option.id, option);
        }
      });
    });

    return Array.from(pricingOptionsMap.values());
  }

  getPlansForPricingOption(pricingOptionId: string): OfferingPlan[] {
    const offering = this.offeringService.offering$();
    return getPlansForPricingOption(offering, pricingOptionId);
  }

  onPlanChange(planId: string | undefined) {
    if (!planId) return;
    this.selectedPlanId.set(planId);
  }

  onPricingOptionChange(pricingOptionId: string | undefined) {
    if (!pricingOptionId) return;
    this.selectedPricingOptionId.set(pricingOptionId);

    // Reset plan selection to first plan with this pricing option
    const plansForOption = this.getPlansForPricingOption(pricingOptionId);
    if (plansForOption.length > 0 && plansForOption[0].id) {
      this.selectedPlanId.set(plansForOption[0].id);
    } else {
      this.selectedPlanId.set(null);
    }
  }

  formatPrice(plan: OfferingPlan): string {
    const pricingOption = this.getSelectedPricingOption();
    if (pricingOption) {
      return formatPriceForPricingOption(plan, pricingOption);
    }
    return formatPrice(plan);
  }

  formatInterval(plan: OfferingPlan): string {
    // Get the selected pricing option to determine the interval
    const pricingOption = this.getSelectedPricingOption();
    if (pricingOption) {
      return formatPricingOptionInterval(pricingOption);
    }
    return 'year';
  }

  async onSignUp() {
    if (this.membershipStatus$().isActive) {
      // Already a member
      return;
    }

    if (!this.isAuthenticated()) {
      // Redirect to login with return URL
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/plus' } });
      return;
    }

    this.showSignUpModal.set(true);
  }

  async confirmSubscription() {
    this.isProcessing.set(true);
    this.errorMessage.set('');

    try {
      const planId = this.selectedPlanId();
      if (!planId) {
        this.errorMessage.set('Please select a plan');
        return;
      }

      const pricingOptionId = this.selectedPricingOptionId();

      if (!pricingOptionId) {
        this.errorMessage.set('Please select a pricing option');
        return;
      }

      // Add the subscription to cart
      await this.cartService.addSubscriptionToCart(OFFERING_ID, planId, pricingOptionId);

      this.showSignUpModal.set(false);
      // Redirect to cart
      this.router.navigate(['/cart']);
    } catch (error) {
      console.error('Failed to add subscription to cart:', error);
      this.errorMessage.set('Unable to add subscription to cart. Please try again.');
    } finally {
      this.isProcessing.set(false);
    }
  }

  closeModal() {
    this.showSignUpModal.set(false);
    this.errorMessage.set('');
  }
}
