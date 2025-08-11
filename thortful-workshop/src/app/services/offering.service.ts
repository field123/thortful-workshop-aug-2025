import { Injectable, inject, signal } from '@angular/core';
import { getOffering, type GetOfferingResponse } from '@epcc-sdk/sdks-shopper';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class OfferingService {
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

      if (response.data) {
        this.offeringSignal.set(response.data);
        return response.data;
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
}
