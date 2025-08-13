import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCOUNT_MEMBER_TOKEN_COOKIE_KEY } from "@/app/constants";
import { getV2AccountMembers, getV2Accounts, listSubscriptions } from "@epcc-sdk/sdks-shopper";
import { initializeShopperClient } from "@/lib/epcc-shopper-client";
import CancelSubscriptionButton from "./CancelSubscriptionButton";
import styles from "./page.module.css";

initializeShopperClient();

async function getAccountData(token: string) {
    try {
        // Get member data
        const memberResponse = await getV2AccountMembers({
            headers: {
                'EP-Account-Management-Authentication-Token': token
            }
        });

        if (memberResponse.error) {
            console.error('Failed to fetch member data:', memberResponse.error);
            return null;
        }

        // Get account data
        const accountResponse = await getV2Accounts({
            headers: {
                'EP-Account-Management-Authentication-Token': token
            }
        });

        if (accountResponse.error) {
            console.error('Failed to fetch account data:', accountResponse.error);
            return null;
        }

        const memberData = memberResponse.data?.data?.[0];
        const accountData = accountResponse.data?.data?.[0];

        return {
            member: memberData,
            account: accountData
        };
    } catch (error) {
        console.error('Error fetching account data:', error);
        return null;
    }
}

export const dynamic = 'force-dynamic'; // Ensure this page is always fresh

// Helper function to determine subscription display status and style
function getSubscriptionDisplayInfo(subscription: any) {
    const meta = subscription.meta;
    const status = meta?.status;
    
    // Check state flags in meta
    if (meta?.canceled) {
        return { text: 'Cancelled', className: 'cancelled' };
    } else if (meta?.paused) {
        return { text: 'Paused', className: 'paused' };
    } else if (meta?.pending) {
        return { text: 'Pending Activation', className: 'pending' };
    } else if (meta?.suspended) {
        return { text: 'Suspended', className: 'suspended' };
    } else if (status === 'active') {
        return { text: 'Active', className: 'active' };
    }
    
    // Fallback
    return { text: 'Unknown', className: 'unknown' };
}

export default async function AccountPage() {
    const cookieStore = await cookies();
    const authToken = cookieStore.get(ACCOUNT_MEMBER_TOKEN_COOKIE_KEY)?.value;

    if (!authToken) {
        redirect('/login');
    }

    const accountData = await getAccountData(authToken);

    if (!accountData) {
        redirect('/login');
    }

    const subscriptions = await listSubscriptions({
        query: {
            include: ["plans", "pricing_options"]
        }
    })

    console.log("Subs request: ", subscriptions.request.headers, subscriptions.request.url, subscriptions.request.method);
    console.log("Subscriptions:", subscriptions.data?.data?.map((item) => item.meta.state), subscriptions.error);

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>My Account</h1>
            
            <div className={styles.sections}>
                {/* Account Details Section */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Account Details</h2>
                    <div className={styles.detailsCard}>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>Name:</span>
                            <span className={styles.value}>{accountData.member?.name || 'Not set'}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>Email:</span>
                            <span className={styles.value}>{accountData.member?.email}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>Account Type:</span>
                            <span className={styles.value}>{accountData.account?.type || 'Standard'}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>Member Since:</span>
                            <span className={styles.value}>
                                {accountData.member?.meta?.timestamps?.created_at 
                                    ? new Date(accountData.member.meta.timestamps.created_at).toLocaleDateString('en-GB', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })
                                    : 'Unknown'}
                            </span>
                        </div>
                    </div>
                </section>

                {/* Subscriptions Section */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>My Subscriptions</h2>
                    
                    {subscriptions.data?.data && subscriptions.data.data.length > 0 ? (
                        <div className={styles.subscriptionsGrid}>
                            {subscriptions.data.data
                                .sort((a: any, b: any) => {
                                    // Sort by created_at date, newest first
                                    const dateA = new Date(a.meta?.timestamps?.created_at || 0);
                                    const dateB = new Date(b.meta?.timestamps?.created_at || 0);
                                    return dateB.getTime() - dateA.getTime();
                                })
                                .map((subscription: any) => {
                                // Get the plan using the plan_id from subscription attributes
                                const planId = subscription.attributes?.plan_id;
                                const plan = subscriptions.data?.included?.plans?.find((p: any) => p.id === planId);
                                
                                // Get the pricing option using the pricing_option_id from subscription attributes
                                const pricingOptionId = subscription.attributes?.pricing_option_id;
                                const pricingOption = subscriptions.data?.included?.pricing_options?.find((p: any) => p.id === pricingOptionId);
                                
                                // Format the price
                                let formattedPrice = '£4.99/month';
                                if (pricingOption && plan) {
                                    // Check if the pricing option has prices for this plan
                                    const priceData = pricingOption.meta?.prices?.[planId];
                                    if (priceData?.display_price?.without_tax?.formatted) {
                                        formattedPrice = priceData.display_price.without_tax.formatted;
                                    } else if (priceData?.display_price?.with_tax?.formatted) {
                                        formattedPrice = priceData.display_price.with_tax.formatted;
                                    }
                                    
                                    // Add interval
                                    const interval = pricingOption.attributes?.billing_interval_type || 'month';
                                    const frequency = pricingOption.attributes?.billing_frequency || 1;
                                    const intervalText = frequency === 1 ? interval : `${frequency} ${interval}s`;
                                    formattedPrice = `${formattedPrice}/${intervalText}`;
                                }
                                
                                // Get subscription display info
                                const displayInfo = getSubscriptionDisplayInfo(subscription);
                                
                                return (
                                    <div key={subscription.id} className={styles.subscriptionCard}>
                                        <div className={styles.subscriptionHeader}>
                                            <h3 className={styles.subscriptionName}>
                                                {plan?.attributes?.name || 'Thortful Plus'}
                                            </h3>
                                            <span className={`${styles.status} ${styles[displayInfo.className]}`}>
                                                {displayInfo.text}
                                            </span>
                                        </div>
                                        
                                        <div className={styles.subscriptionDetails}>
                                            <p className={styles.price}>{formattedPrice}</p>
                                            {/* Show next billing only for active subscriptions */}
                                            {subscription.meta?.status === 'active' && !subscription.meta?.canceled && !subscription.meta?.paused && subscription.meta?.invoice_after && (
                                                <p className={styles.nextBilling}>
                                                    Next billing: {new Date(subscription.meta.invoice_after).toLocaleDateString('en-GB')}
                                                </p>
                                            )}
                                            {/* Show go live date for pending subscriptions */}
                                            {subscription.meta?.pending && subscription.attributes?.go_live_after && (
                                                <p className={styles.nextBilling}>
                                                    Starts: {new Date(subscription.attributes.go_live_after).toLocaleDateString('en-GB')}
                                                </p>
                                            )}
                                        </div>

                                        {plan?.attributes?.description && (
                                            <div className={styles.description}>
                                                <p>{plan.attributes.description}</p>
                                            </div>
                                        )}

                                        {/* Show cancel button only for active subscriptions that aren't already canceled */}
                                        {subscription.meta?.status === 'active' && !subscription.meta?.canceled && !subscription.meta?.paused && (
                                            <CancelSubscriptionButton subscriptionId={subscription.id} />
                                        )}
                                        
                                        {/* Show appropriate message for other states */}
                                        {subscription.meta?.paused && (
                                            <div className={styles.stateMessage}>
                                                Subscription is paused
                                            </div>
                                        )}
                                        {subscription.meta?.canceled && (
                                            <div className={styles.stateMessage}>
                                                Subscription has been cancelled
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className={styles.noSubscriptions}>
                            <p>You don't have any active subscriptions.</p>
                            <a href="/plus" className={styles.exploreButton}>
                                Explore Thortful Plus
                            </a>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}