import {createAnAccessToken, putV2AccountsAccountId} from "@epcc-sdk/sdks-shopper";

async function createStripeCustomer({email, name, token}: {email: string, name: string, token: string}) {

    const result = await fetch(process.env.ELASTIC_PATH_PAYMENTS_CUSTOMERS_PROXY_URL!, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            email,
            name
        })
    })

    if (!result.ok) {
        console.error("Failed to create Stripe customer", result.statusText);
        throw new Error("Failed to create Stripe customer");
    }

    const data: {id: string} = await result.json();
    return data.id;
}

export async function syncEpPaymentCustomer({email, name, accountId}: { email: string, name: string, accountId: string }) {
    const clientCredentialsToken = await createAnAccessToken({
        body: {
            grant_type: "client_credentials",
            client_id: process.env.NEXT_PUBLIC_EPCC_CLIENT_ID!,
            client_secret: process.env.EPCC_CLIENT_SECRET!,
        },
    })

    if (clientCredentialsToken.error) {
        return Response.json({ error: "Failed to create client credentials token" }, { status: 500 });
    }

    const stripeCustomerId = await createStripeCustomer({email, name, token: clientCredentialsToken.data.access_token!});
    const updateAccountResponse = await putV2AccountsAccountId({
        path: {
            accountID: accountId
        },
        headers: {
            "Authorization": `Bearer ${clientCredentialsToken.data.access_token}`,
        },
        body: {
            data: {
                type: "account",
                // @ts-ignore
                'stripe-account-id': stripeCustomerId
            }
        }
    })

    if (updateAccountResponse.error) {
        console.error("Failed to update account with Stripe customer ID", updateAccountResponse.error);
        throw new Error("Failed to update account with Stripe customer ID");
    }

    return { success: true, stripeCustomerId };

}
