"use client";

import { ReactNode, useMemo } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, Stripe } from "@stripe/stripe-js";

const publishableKey =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  "pk_test_XXXXXXXXXXXXXXXXXXXXXXXX";

let stripePromise: Promise<Stripe | null> | null = null;

const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

export function StripeProvider({ children }: { children: ReactNode }) {
  const options = useMemo(
    () => ({
      appearance: {
        theme: "stripe" as const,
        variables: {
          colorPrimary: "#4f46e5",
        },
      },
    }),
    [],
  );

  return (
    <Elements stripe={getStripe()} options={options}>
      {children}
    </Elements>
  );
}


