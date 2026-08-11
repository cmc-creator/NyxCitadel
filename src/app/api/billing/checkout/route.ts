import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.facilityId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const facilityId = session.user.facilityId;
  const baseUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || '';

  if (!process.env.STRIPE_SECRET_KEY) {
    // Demo / Fallback mode: activate trial and redirect back to billing page
    await prisma.facility.update({
      where: { id: facilityId },
      data: {
        subscriptionStatus: 'active',
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.redirect(`${baseUrl}/settings/billing?success=1`, { status: 303 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-04-22.dahlia' });

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
      success_url: `${baseUrl}/settings/billing?success=1`,
      cancel_url: `${baseUrl}/settings/billing?canceled=1`,
      metadata: { facilityId },
    });

    return NextResponse.redirect(checkoutSession.url || `${baseUrl}/settings/billing?success=1`, { status: 303 });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return NextResponse.redirect(`${baseUrl}/settings/billing?success=1`, { status: 303 });
  }
}
