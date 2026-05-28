import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.facilityId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Billing not configured' }, { status: 503 });
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-04-22.dahlia' });

  const facilityId = session.user.facilityId;

  try {
    const facility = await prisma.facility.findUnique({
      where: { id: facilityId },
      select: { id: true, name: true, stripeCustomerId: true },
    });
    if (!facility) return NextResponse.json({ error: 'Facility not found' }, { status: 404 });

    let customerId = facility.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        name: facility.name,
        metadata: { facilityId },
      });
      customerId = customer.id;
      await prisma.facility.update({ where: { id: facilityId }, data: { stripeCustomerId: customerId } });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
      subscription_data: { trial_period_days: 30 },
      success_url: `${process.env.NEXTAUTH_URL}/settings/billing?success=1`,
      cancel_url: `${process.env.NEXTAUTH_URL}/settings/billing?canceled=1`,
      metadata: { facilityId },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
