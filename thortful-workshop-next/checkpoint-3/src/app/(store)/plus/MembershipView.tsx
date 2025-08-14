'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { type GetOfferingResponse, type OfferingPlan, type OfferingPricingOption } from '@epcc-sdk/sdks-shopper';
import {
  getPlans,
  getPlanById,
  getPricingOptionsForPlan,
  getPlansForPricingOption,
  formatPriceForPricingOption,
  formatPricingOptionInterval
} from '@/lib/offering-helpers';
import { addSubscriptionToCart } from '@/app/actions/cart';
import styles from './membership.module.css';

interface MembershipViewProps {
  offering: GetOfferingResponse | null;
}

function getAllUniquePricingOptions(offering: GetOfferingResponse | null): OfferingPricingOption[] {
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

const benefits = [
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

const testimonials = [
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

export default function MembershipView({ offering }: MembershipViewProps) {
  const router = useRouter();
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(getPlans(offering)?.[0]?.id || null);
  const [selectedPricingOptionId, setSelectedPricingOptionId] = useState<string | null>(null);

  useEffect(() => {
    const plans = getPlans(offering);
    if (plans.length > 0) {
      const firstPlan = plans[0];
      if (firstPlan.id) {
        setSelectedPlanId(firstPlan.id);

        const pricingOptions = getPricingOptionsForPlan(offering, firstPlan);
        if (pricingOptions.length > 0 && pricingOptions[0].id) {
          setSelectedPricingOptionId(pricingOptions[0].id);
        }
      }
    }
  }, [offering]);

  const getSelectedPlan = (): OfferingPlan | undefined => {
    if (!selectedPlanId) return undefined;
    return getPlanById(offering, selectedPlanId);
  };

  const getSelectedPricingOption = (): OfferingPricingOption | undefined => {
    const plan = getSelectedPlan();
    if (!plan || !selectedPricingOptionId) return undefined;

    const pricingOptions = getPricingOptionsForPlan(offering, plan);
    return pricingOptions.find(option => option.id === selectedPricingOptionId);
  };

  const formatPrice = (plan: OfferingPlan): string => {
    const pricingOption = getSelectedPricingOption();
    if (pricingOption) {
      return formatPriceForPricingOption(plan, pricingOption);
    }
    return '£9.99';
  };

  const formatInterval = (plan: OfferingPlan): string => {
    const pricingOption = getSelectedPricingOption();
    if (pricingOption) {
      return formatPricingOptionInterval(pricingOption);
    }
    return 'year';
  };

  const handlePricingOptionChange = (pricingOptionId: string | undefined) => {
    if (!pricingOptionId) return;
    setSelectedPricingOptionId(pricingOptionId);

    const plansForOption = getPlansForPricingOption(offering, pricingOptionId);
    if (plansForOption.length > 0 && plansForOption[0].id) {
      setSelectedPlanId(plansForOption[0].id);
    } else {
      setSelectedPlanId(null);
    }
  };

  const handleSignUp = () => {
    setShowSignUpModal(true);
  };

  const handleConfirmSubscription = async () => {
    setIsProcessing(true);
    setErrorMessage('');

    try {
      if (!selectedPlanId) {
        setErrorMessage('Please select a plan');
        return;
      }

      if (!selectedPricingOptionId) {
        setErrorMessage('Please select a pricing option');
        return;
      }

      const result = await addSubscriptionToCart(
        '5bae1137-59c7-409a-87d6-72023fa22b17',
        selectedPlanId,
        selectedPricingOptionId
      );

      if (result.success) {
        setShowSignUpModal(false);
        router.push('/cart');
      } else {
        setErrorMessage(result.error || 'Failed to add subscription to cart');
      }
    } catch (error) {
      console.error('Failed to add subscription to cart:', error);
      setErrorMessage('Unable to add subscription to cart. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedPlan = getSelectedPlan();

  if (!offering) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Failed to load membership offering</p>
      </div>
    );
  }

  return (
    <main className={styles.membershipPage}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Thortful Plus</h1>
            <p className={styles.heroSubtitle}>Plus perk: 30% off ALL cards</p>
            <p className={styles.heroDescription}>
              Same amazing perks! Save 30% on all cards – the perfect way to make every occasion special without breaking the bank.
            </p>
            <div className={styles.heroCta}>
              {selectedPlan && (
                <button 
                  className={styles.ctaButton}
                  onClick={handleSignUp}
                >
                  Add Plus for {formatPrice(selectedPlan)}/{formatInterval(selectedPlan)}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className={styles.benefitsSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>
            Your exclusive benefits auto applied at checkout
          </h2>
          <div className={styles.benefitsGrid}>
            {benefits.map((benefit) => (
              <div key={benefit.title} className={styles.benefitCard}>
                <div className={styles.benefitIcon}>{benefit.icon}</div>
                <h3 className={styles.benefitTitle}>{benefit.title}</h3>
                <p className={styles.benefitDescription}>{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className={styles.testimonialsSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>
            5-star reviews from our happy customers
          </h2>
          <div className={styles.testimonialsGrid}>
            {testimonials.map((testimonial) => (
              <div key={testimonial.text} className={styles.testimonialCard}>
                <div className={styles.stars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={styles.star}>⭐</span>
                  ))}
                </div>
                <p className={styles.testimonialText}>{testimonial.text}</p>
                <p className={styles.testimonialAuthor}>{testimonial.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to save on every card?</h2>
          <p className={styles.ctaSubtitle}>
            Join Thortful Plus today and start enjoying exclusive benefits
          </p>
          {selectedPlan && (
            <button 
              className={styles.ctaButtonLarge}
              onClick={handleSignUp}
            >
              Get Thortful Plus for {formatPrice(selectedPlan)}/{formatInterval(selectedPlan)}
            </button>
          )}
          <p className={styles.ctaDisclaimer}>Cancel anytime. T&Cs apply.</p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={styles.faqSection}>
        <div className={styles.container}>
          <div className={styles.faqLinks}>
            <a href="/support/thortful-plus" className={styles.faqLink}>
              <h3>Got a question?</h3>
              <p>Learn More</p>
            </a>
            <a href="/terms/thortful-plus" className={styles.faqLink}>
              <h3>The important bits</h3>
              <p>Read Now</p>
            </a>
          </div>
        </div>
      </section>

      {/* Sign-up Modal */}
      {showSignUpModal && (
        <div className={styles.modalOverlay} onClick={() => setShowSignUpModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button 
              className={styles.modalClose}
              onClick={() => setShowSignUpModal(false)}
            >
              ×
            </button>

            <h2 className={styles.modalTitle}>Complete Your Thortful Plus Subscription</h2>

            {/* Pricing Option Selection */}
            {getAllUniquePricingOptions(offering).length > 1 && (
              <div className={styles.pricingOptionTabs}>
                {getAllUniquePricingOptions(offering).map((option) => (
                  <button
                    key={option.id}
                    className={`${styles.pricingTab} ${
                      selectedPricingOptionId === option.id ? styles.active : ''
                    }`}
                    onClick={() => handlePricingOptionChange(option.id)}
                  >
                    {option.attributes?.name || 'Option'}
                  </button>
                ))}
              </div>
            )}

            {/* Plan Selection */}
            {getPlansForPricingOption(offering, selectedPricingOptionId || '').length > 1 && (
              <div className={styles.planSelection}>
                <h3>Choose your plan:</h3>
                <div className={styles.plansGrid}>
                  {getPlansForPricingOption(offering, selectedPricingOptionId || '').map((plan) => (
                    <label 
                      key={plan.id} 
                      className={`${styles.planOption} ${
                        selectedPlanId === plan.id ? styles.selected : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="plan"
                        value={plan.id}
                        checked={selectedPlanId === plan.id}
                        onChange={() => setSelectedPlanId(plan.id || null)}
                      />
                      <span className={styles.planName}>{plan.attributes?.name || 'Plan'}</span>
                      <span className={styles.planPrice}>{formatPrice(plan)}/{formatInterval(plan)}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.subscriptionSummary}>
              {selectedPlan && (
                <>
                  <h3>{selectedPlan.attributes?.name || 'Thortful Plus'}</h3>
                  <p className={styles.price}>{formatPrice(selectedPlan)}/{formatInterval(selectedPlan)}</p>
                  {selectedPlan.attributes?.description && (
                    <p className={styles.planDescription}>{selectedPlan.attributes.description}</p>
                  )}
                </>
              )}

              <div className={styles.benefitsSummary}>
                <h4>Your benefits include:</h4>
                <ul>
                  {benefits.map((benefit) => (
                    <li key={benefit.title}>
                      {benefit.title}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {errorMessage && (
              <div className={styles.errorMessage}>{errorMessage}</div>
            )}

            <div className={styles.modalActions}>
              <button
                className={styles.confirmButton}
                onClick={handleConfirmSubscription}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : selectedPlan ? `Add to Cart - ${formatPrice(selectedPlan)}/${formatInterval(selectedPlan)}` : 'Add to Cart'}
              </button>
              <button 
                className={styles.cancelButton}
                onClick={() => setShowSignUpModal(false)} 
                disabled={isProcessing}
              >
                Cancel
              </button>
            </div>

            <p className={styles.termsNotice}>
              By subscribing, you agree to our <a href="/terms/thortful-plus">Terms & Conditions</a>
            </p>
          </div>
        </div>
      )}
    </main>
  );
}