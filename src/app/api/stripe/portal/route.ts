import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/libs/DB';
import { Env } from '@/libs/Env';
import { stripe } from '@/libs/Stripe';
import { subscriptionSchema } from '@/models/Schema';

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const subscription = await db.query.subscriptionSchema.findFirst({
    where: eq(subscriptionSchema.userId, userId),
  });

  if (!subscription) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
  }

  const appUrl = Env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${appUrl}/dashboard/billing`,
  });

  return NextResponse.json({ url: session.url });
}
