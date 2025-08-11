import { Injectable, inject, PLATFORM_ID, TransferState, makeStateKey } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { getOffering, OfferingPlan, type GetOfferingResponse } from '@epcc-sdk/sdks-shopper';
import { AuthService } from './auth.service';
import { signal } from '@angular/core';

const OFFERING_KEY = makeStateKey<GetOfferingResponse>('offering');

@Injectable({
  providedIn: 'root'
})
export class OfferingService {
  private platformId = inject(PLATFORM_ID);
  private transferState = inject(TransferState);
  private authService = inject(AuthService);

  private offeringSignal = signal<GetOfferingResponse | null>(null);
  public offering$ = this.offeringSignal.asReadonly();

  private loadingSignal = signal(false);
  public loading$ = this.loadingSignal.asReadonly();

  private errorSignal = signal<string | null>(null);
  public error$ = this.errorSignal.asReadonly();

  async fetchOffering(offeringId: string): Promise<GetOfferingResponse | null> {
    try {
      this.loadingSignal.set(true);
      this.errorSignal.set(null);

      // Check transfer state first (for client-side hydration)
      if (isPlatformBrowser(this.platformId)) {
        const transferredOffering = this.transferState.get(OFFERING_KEY, null);
        if (transferredOffering) {
          this.offeringSignal.set(transferredOffering);
          this.transferState.remove(OFFERING_KEY);
          return transferredOffering;
        }
      }

      // Ensure we have a valid token
      await this.authService.ensureValidToken();

      // Fetch the offering
      const response = await getOffering({
        path: {
          offering_uuid: offeringId
        },
        query: {
          include: ['plans', 'pricing_options', 'features']
        }
      });

      if (response.data?.data) {
        const offeringData = response.data;
        this.offeringSignal.set(offeringData);

        // Store in transfer state for SSR
        if (isPlatformServer(this.platformId)) {
          this.transferState.set(OFFERING_KEY, offeringData);
        }

        return offeringData;
      }

      throw new Error('No offering data received');
    } catch (error) {
      console.error('Failed to fetch offering:', error);
      this.errorSignal.set('Failed to load membership offering');
      return null;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  getPlans(): OfferingPlan[] {
    const offering = this.offeringSignal() as any;
    
    // The API returns included as an object with plans array
    if (offering?.included?.plans && Array.isArray(offering.included.plans)) {
      return offering.included.plans;
    }
    
    return [];
  }

  getProducts() {
    // Products are no longer included in the offering response
    // This method is kept for backward compatibility but returns empty array
    return [];
  }

  getFeatures() {
    const offering = this.offeringSignal();
    return offering?.included?.features || [];
  }

  getPlanById(planId: string) {
    const plans = this.getPlans();
    return plans.find((plan: any) => plan.id === planId);
  }

  getPricingOptions() {
    const offering = this.offeringSignal() as any;
    // The API returns included as an object with pricing_options array
    if (offering?.included?.pricing_options && Array.isArray(offering.included.pricing_options)) {
      return offering.included.pricing_options;
    }
    return [];
  }
}
