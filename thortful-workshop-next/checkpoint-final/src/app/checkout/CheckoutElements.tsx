"use client";
import {loadStripe, StripeElementsOptions} from "@stripe/stripe-js";
import {Elements} from "@stripe/react-stripe-js";
import CheckoutForm from "@/app/checkout/CheckoutForm";
import {type CartEntityResponse} from "@epcc-sdk/sdks-shopper";

const stripePromise = loadStripe('pk_test_qblFNYngBkEdjEZ16jxxoWSM');

export function CheckoutElements({cart}: {cart: CartEntityResponse}) {
    const amount = cart.data.meta?.display_price?.with_tax?.amount
    const currency = cart.data.meta?.display_price?.with_tax?.currency

    if (!amount) {
        console.error("Cart does not have a valid amount for payment");
        return <span>Cart amount is not available</span>;
    }

    if (!currency) {
        console.error("Cart does not have a valid currency for payment");
        return <span>Cart currency is not available</span>;
    }

    const options: StripeElementsOptions = {
        mode: 'payment',
        amount,
        currency: currency.toLowerCase(),
        // Fully customizable with appearance API.
        appearance: {
            theme: 'stripe' as const
        }
    };

    return (
        <Elements stripe={stripePromise} options={options}>
            <CheckoutForm />
        </Elements>
    );
};