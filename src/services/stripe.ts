import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;
let currentPublishableKey: string | null = null;

/**
 * Returns a configured Stripe instance.
 * Reads publishable key from import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
 * or allows passing a runtime key returned by the backend checkout endpoint.
 */
export function getStripe(overrideKey?: string | null): Promise<Stripe | null> {
  const key =
    overrideKey ||
    (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined)?.trim() ||
    'pk_live_51UBiwaLPgHXyEaQiK3F7amfvgxhqGKdpOlgmHTYTQUo92srJ9KbQYQwh54MRORxyr5KqhXPTAt2ZXzJUU8mNdbAS00vxuhcxuf';

  if (!key) {
    return Promise.resolve(null);
  }

  if (!stripePromise || currentPublishableKey !== key) {
    currentPublishableKey = key;
    stripePromise = loadStripe(key);
  }

  return stripePromise;
}

/**
 * Shopify-matched custom styling for Stripe Elements (Card / Payment Element)
 */
export const shopifyStripeElementStyles = {
  style: {
    base: {
      color: '#1c1917',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      fontSmoothing: 'antialiased',
      fontSize: '15px',
      lineHeight: '24px',
      '::placeholder': {
        color: '#9ca3af',
      },
      iconColor: '#166534',
    },
    invalid: {
      color: '#dc2626',
      iconColor: '#dc2626',
    },
  },
};
