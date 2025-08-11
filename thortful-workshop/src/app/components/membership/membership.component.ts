import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MembershipService } from '../../services/membership.service';
import { OfferingService } from '../../services/offering.service';
import { CartService } from '../../services/cart.service';

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
    const plans = this.offeringService.getPlans();
    if (plans.length > 0) {
      const firstPlan = plans[0];
      if (firstPlan.id) {
        this.selectedPlanId.set(firstPlan.id);
        
        // Get pricing options for this plan
        const pricingOptions = this.getPricingOptions(firstPlan);
        if (pricingOptions.length > 0 && pricingOptions[0].id) {
          this.selectedPricingOptionId.set(pricingOptions[0].id);
        }
      }
    }
  }

  getSelectedPlan() {
    const planId = this.selectedPlanId();
    if (!planId) return null;
    return this.offeringService.getPlanById(planId);
  }

  getPricingOptions(plan: any) {
    // First check if pricing options are directly on the plan
    if (plan?.attributes?.pricing_options && Array.isArray(plan.attributes.pricing_options)) {
      return plan.attributes.pricing_options;
    }
    
    // Check if pricing option IDs are in relationships
    if (plan?.relationships?.pricing_options?.data && Array.isArray(plan.relationships.pricing_options.data)) {
      // Get the actual pricing option objects from the offering service
      const allPricingOptions = this.offeringService.getPricingOptions();
      const planPricingOptionIds = plan.relationships.pricing_options.data.map((po: any) => po.id);
      return allPricingOptions.filter((option: any) => planPricingOptionIds.includes(option.id));
    }
    
    return [];
  }

  getSelectedPricingOption() {
    const plan = this.getSelectedPlan();
    const pricingOptionId = this.selectedPricingOptionId();
    if (!plan || !pricingOptionId) return null;
    
    const pricingOptions = this.getPricingOptions(plan);
    return pricingOptions.find((option: any) => option.id === pricingOptionId);
  }

  getAllUniquePricingOptions() {
    const plans = this.offeringService.getPlans();
    const pricingOptionsMap = new Map();
    
    plans.forEach((plan: any) => {
      const pricingOptions = this.getPricingOptions(plan);
      pricingOptions.forEach((option: any) => {
        if (!pricingOptionsMap.has(option.id)) {
          pricingOptionsMap.set(option.id, option);
        }
      });
    });
    
    return Array.from(pricingOptionsMap.values());
  }

  getPlansForPricingOption(pricingOptionId: string) {
    const plans = this.offeringService.getPlans();
    return plans.filter((plan: any) => {
      const pricingOptions = this.getPricingOptions(plan);
      return pricingOptions.some((option: any) => option.id === pricingOptionId);
    });
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

  formatPrice(plan: any) {
    if (!plan?.attributes?.prices?.[0]) return '£9.99';
    const price = plan.attributes.prices[0];
    const amount = (price.unit_amount?.amount || 999) / 100;
    return `£${amount.toFixed(2)}`;
  }

  formatInterval(plan: any) {
    if (!plan?.attributes?.billing_frequency) return 'year';
    const frequency = plan.attributes.billing_frequency;
    return frequency === 'annually' ? 'year' : frequency;
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
