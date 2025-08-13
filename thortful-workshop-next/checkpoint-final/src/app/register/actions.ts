"use server"

import { postV2AccountMembersTokens} from "@epcc-sdk/sdks-shopper"
import {initializeShopperClient} from "@/lib/epcc-shopper-client";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import {ACCOUNT_MEMBER_TOKEN_COOKIE_KEY} from "@/app/constants";
import {syncEpPaymentCustomer} from "@/app/register/sync-ep-payments";

const passwordProfileId = process.env.PASSWORD_PROFILE_ID

initializeShopperClient()

export async function registerUser(redirectUrl: string | null, prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;
    if (!email || !password) {
        return {
            message: 'Email and password are required'
        };
    }

    if (typeof passwordProfileId !== 'string') {
        console.error("Missing PASSWORD_PROFILE_ID environment variable");
        return {
            message: 'Server configuration error. Please try again later.'
        };
    }

    try {
        const response = await postV2AccountMembersTokens({
            body: {
                data: {
                    type: "account_management_authentication_token",
                    authentication_mechanism: "self_signup",
                    password_profile_id: passwordProfileId,
                    username: email,
                    password,
                    name,
                    email
                }
            }
        })

        if (response.error) {
            console.error(response.error);
            return {
                message: 'There was an error creating your account. Please try again.'
            };
        }

            // set the token on a cookie
        const account = response.data?.data?.[0]
        const expires = response.data?.data?.[0].expires
        if (!account || !expires) {
            return {
                message: 'Login response did not contain token or expiration'
            };
        }

        const resultCreation = await syncEpPaymentCustomer({
            email: email,
            name: name,
            accountId: account.account_id!
        })

        const cookieStore = await cookies();

        cookieStore.set({
            name: ACCOUNT_MEMBER_TOKEN_COOKIE_KEY,
            value: JSON.stringify({
                accounts: response.data?.data?.reduce((acc, item) => {
                    return {
                        ...acc,
                        [item.account_id!]: item
                    }
                }, {}),
                selected: account.account_id,
                accountMemberId: response.data.meta?.account_member_id
            }),
            httpOnly: true,
            // @ts-ignore expires is typed incorrectly in the SDK it's infact an ISO8601 string
            expires: new Date(expires * 1000), // Convert seconds to milliseconds
            path: '/',
        })
    } catch (error) {
        console.error('Login error:', error);
        return {
            message: 'An error occurred during login. Please try again.'
        };
    }

    // Redirect to the provided URL or fallback to home
    const destination = redirectUrl || "/";
    redirect(destination)
}

