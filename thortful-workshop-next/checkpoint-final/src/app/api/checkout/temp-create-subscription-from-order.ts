import {
    AccountMemberResponse,
    AccountResponse,
    CartEntityResponse,
    CartIncluded,
    client,
    SubscriptionItemObject
} from "@epcc-sdk/sdks-shopper";

/**
 * There is in flight work to have the create subscription event triggered from the confirm order api call.
 * This has not yet been released, so we are manually creating the subscription here.
 * This should be removed once the event is triggered automatically.
 */
export async function temporaryCreateSubscriptionFromOrder({orderId, clientCredentialsAccessToken, cart, accountData, memberData, stripeCustomerId, paymentMethodId}: {orderId: string, clientCredentialsAccessToken: string, cart: CartEntityResponse, accountData: AccountResponse, memberData: AccountMemberResponse, stripeCustomerId: string, paymentMethodId: string}) {
    const baseUrl = client.getConfig().baseUrl

    const extractedSubscriptionItems = (cart.included?.items?.filter(filterSubscriptionItems) as SubscriptionItemObject["data"][]) || [];

    const cartCurrency = cart.data?.meta?.display_price?.with_tax?.currency ?? "GBP";

    const createSubscriptionPromises = extractedSubscriptionItems.map((item) => {
        return fetch(`${baseUrl}/v2/subscriptions/subscriptions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${clientCredentialsAccessToken}`,
            },
            body: JSON.stringify({
                data: {
                    account_id: accountData.id,
                    offering_id: item?.subscription_offering_id,
                    plan_id: item?.subscription_configuration.plan,
                    pricing_option_id: item?.subscription_configuration.pricing_option,
                    currency: cartCurrency,
                    payment_authority: {
                        type: "elastic_path_payments_stripe",
                        customer_id: stripeCustomerId,
                        card_id: paymentMethodId
                    },
                    manual_payments: false,
                    name: memberData.name,
                    email: memberData.email,
                    pending: false,
                    first_invoice_paid: true
                }
            })
        })
    })

    const results = await Promise.all(createSubscriptionPromises)

    results.forEach(async (result, index) => {
        if (!result.ok) {
            console.error(`Failed to create subscription for item ${index}:`, result.statusText, await result.json());
        } else {
            console.debug(`Successfully created subscription for item ${index}`, await result.json());
        }
    })

    return { success: true, orderId };
}

function filterSubscriptionItems(items: NonNullable<CartIncluded["items"]>[number]): items is SubscriptionItemObject {
    return (items as any).type === 'subscription_item';
}
