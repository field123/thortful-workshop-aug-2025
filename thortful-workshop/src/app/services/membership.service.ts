import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { signal } from '@angular/core';

export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  benefits: string[];
}

export interface MembershipStatus {
  isActive: boolean;
  plan?: MembershipPlan;
  expiresAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class MembershipService {
  private authService = inject(AuthService);
  
  private membershipStatus = signal<MembershipStatus>({ isActive: false });
  public membershipStatus$ = this.membershipStatus.asReadonly();
  
  private readonly THORTFUL_PLUS_PLAN: MembershipPlan = {
    id: 'thortful-plus-annual',
    name: 'Thortful Plus',
    price: 9.99,
    currency: 'GBP',
    interval: 'year',
    benefits: [
      'First card and postage free',
      '30% off all cards',
      'Free postcard every month',
      '50% off selected cards',
      '40% off when buying 5+ cards',
      'All card sizes included',
      'Global perks',
      'Surprise perks throughout the year'
    ]
  };

  constructor() {
    // Initialize membership status
    this.checkMembershipStatus();
  }

  async checkMembershipStatus(): Promise<void> {
    // TODO: Check with backend API for actual membership status
    // For now, we'll simulate checking local storage
    const mockStatus = this.getMockMembershipStatus();
    this.membershipStatus.set(mockStatus);
  }

  private getMockMembershipStatus(): MembershipStatus {
    // This would normally check the backend
    return { isActive: false };
  }

  async subscribeToPlan(planId: string): Promise<boolean> {
    try {
      // Ensure user is authenticated
      await this.authService.ensureValidToken();
      
      // TODO: Implement actual subscription logic with payment provider
      console.log('Subscribing to plan:', planId);
      
      // Mock successful subscription
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      
      this.membershipStatus.set({
        isActive: true,
        plan: this.THORTFUL_PLUS_PLAN,
        expiresAt
      });
      
      return true;
    } catch (error) {
      console.error('Failed to subscribe:', error);
      return false;
    }
  }

  async cancelMembership(): Promise<boolean> {
    try {
      // TODO: Implement actual cancellation logic
      console.log('Cancelling membership');
      
      this.membershipStatus.set({ isActive: false });
      return true;
    } catch (error) {
      console.error('Failed to cancel membership:', error);
      return false;
    }
  }

  getAvailablePlans(): MembershipPlan[] {
    return [this.THORTFUL_PLUS_PLAN];
  }

  getCurrentPlan(): MembershipPlan {
    return this.THORTFUL_PLUS_PLAN;
  }

  calculateDiscount(originalPrice: number, productType: 'card' | 'gift' = 'card'): number {
    const status = this.membershipStatus();
    
    if (!status.isActive || productType !== 'card') {
      return 0;
    }
    
    // 30% off all cards for Plus members
    return originalPrice * 0.30;
  }

  getDiscountedPrice(originalPrice: number, productType: 'card' | 'gift' = 'card'): number {
    const discount = this.calculateDiscount(originalPrice, productType);
    return originalPrice - discount;
  }
}