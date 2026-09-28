import type Stripe from 'stripe';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/libs/DB';
import { Env } from '@/libs/Env';
import { logger } from '@/libs/Logger';
import { stripe } from '@/libs/Stripe';
import { subscriptionSchema } from '@/models/Schema';

const ACTIVE_STATUSES = new Set(['active', 'trialing']);

// Stripe API versions differ on whether the period end lives on the subscription or its line item.
// Check both so this keeps working regardless of the pinned API version.
const getPeriodEnd = (subscription: Stripe.Subscription) => {
  const raw = subscription.items.data[0]?.current_period_end
    ?? (subscription as unknown as { current_period_end?: number }).current_period_end;

  return raw ? new Date(raw * 1000) : null;
};

const syncSubscription = async (subscription: Stripe.Subscription) => {
  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer.id;

  const plan = ACTIVE_STATUSES.has(subscription.status) ? 'pro' : 'free';
  const price = subscription.items.data[0]?.price;

  await db
    .update(subscriptionSchema)
    .set({
      stripeSubscriptionId: subscription.id,
      stripePriceId: price?.id,
      plan,
      status: subscription.status,
      interval: price?.recurring?.interval,
      currentPeriodEnd: getPeriodEnd(subscription),
    })
    .where(eq(subscriptionSchema.stripeCustomerId, customerId));
};

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  const rawBody = await request.text();

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, Env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    logger.error(`Stripe webhook signature verification failed: ${(error as Error).message}`);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;

      if (typeof session.subscription === 'string') {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        await syncSubscription(subscription);
      }

      break;
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      await syncSubscription(event.data.object);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
