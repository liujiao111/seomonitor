import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import * as z from 'zod';
import { db } from '@/libs/DB';
import { Env } from '@/libs/Env';
import { stripe } from '@/libs/Stripe';
import { subscriptionSchema } from '@/models/Schema';

const checkoutRequestSchema = z.object({
  interval: z.enum(['month', 'year']),
});

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = checkoutRequestSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const priceId = parsed.data.interval === 'month'
    ? Env.STRIPE_PRICE_ID_MONTHLY
    : Env.STRIPE_PRICE_ID_YEARLY;

  let existingSubscription = await db.query.subscriptionSchema.findFirst({
    where: eq(subscriptionSchema.userId, userId),
  });

  if (!existingSubscription) {
    const customer = await stripe.customers.create({ metadata: { userId } });

    [existingSubscription] = await db
      .insert(subscriptionSchema)
      .values({ userId, stripeCustomerId: customer.id })
      .returning();
  }

  const appUrl = Env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: existingSubscription!.stripeCustomerId,
    client_reference_id: userId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard/billing?checkout=success`,
    cancel_url: `${appUrl}/dashboard/billing?checkout=cancelled`,
  });

  if (!session.url) {
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 502 });
  }

  return NextResponse.json({ url: session.url });
}
