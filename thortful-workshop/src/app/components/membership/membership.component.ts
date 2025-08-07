import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MembershipService } from '../../services/membership.service';

@Component({
  selector: 'app-membership',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './membership.component.html',
  styleUrls: ['./membership.component.css']
})
export class MembershipComponent {
  private authService = inject(AuthService);
  private membershipService = inject(MembershipService);
  private router = inject(Router);
  
  showSignUpModal = signal(false);
  isProcessing = signal(false);
  errorMessage = signal('');
  
  membershipStatus$ = this.membershipService.membershipStatus$;
  isAuthenticated = this.authService.isAuthenticated;
  
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
      const success = await this.membershipService.subscribeToPlan(this.plan.id);
      
      if (success) {
        this.showSignUpModal.set(false);
        // Show success message or redirect
        alert('Welcome to Thortful Plus! Your benefits are now active.');
      } else {
        this.errorMessage.set('Unable to process your subscription. Please try again.');
      }
    } catch (error) {
      this.errorMessage.set('An error occurred. Please try again later.');
    } finally {
      this.isProcessing.set(false);
    }
  }
  
  closeModal() {
    this.showSignUpModal.set(false);
    this.errorMessage.set('');
  }
}