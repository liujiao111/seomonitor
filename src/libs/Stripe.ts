import Stripe from 'stripe';
import { Env } from './Env';

declare global {
  // eslint-disable-next-line vars-on-top
  var cachedStripe: Stripe | undefined;
}

// Stored in global scope to prevent multiple instances due to hot reloading with Next.js
const stripe = globalThis.cachedStripe ?? new Stripe(Env.STRIPE_SECRET_KEY);

if (Env.NODE_ENV !== 'production') {
  globalThis.cachedStripe = stripe;
}

export { stripe };
