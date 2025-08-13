'use server';
import { revalidatePath } from 'next/cache';
import {createSubscriptionState} from "@epcc-sdk/sdks-shopper"
import {initializeShopperClient} from "@/lib/epcc-shopper-client";

export async function cancelSubscription(subscriptionId: string, formData: FormData) {
    initializeShopperClient()
    // TODO: Implement subscription cancellation logic
    console.log(`Cancelling subscription: ${subscriptionId}`);

    const stateUpdateResponse = await createSubscriptionState({
        path: {
            subscription_uuid: subscriptionId
        },
        body: {
            data: {
                type: 'subscription_state',
                attributes: {
                    action: 'cancel'
                }
            }
        }
    })

    if (stateUpdateResponse.error) {
        console.error('Failed to update subscription state:', stateUpdateResponse.error);
        throw new Error('Failed to cancel subscription');
    }

    console.log('Subscription state updated successfully:', stateUpdateResponse.data);

    revalidatePath('/account');
}