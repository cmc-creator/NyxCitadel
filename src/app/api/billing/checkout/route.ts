import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.facilityId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const facilityId = session.user.facilityId;
  const baseUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || '';

  // Plan selection: the billing page posts a `plan` form field.
  // Anything missing or unrecognized defaults to starter.
  let plan = 'starter';
  try {
    const form = await req.formData();
    const raw = form.get('plan');
    if (typeof raw === 'string' && raw.trim()) plan = raw.trim().toLowerCase();
  } catch {
    // No readable form body: fall through with the starter default.
  }

  // Enterprise is sold by our team, never through self-serve checkout.
  if (plan === 'enterprise') {
    return NextResponse.redirect(`${baseUrl}/settings/billing?error=enterprise`, { status: 303 });
  }
  if (plan !== 'starter' && plan !== 'professional') plan = 'starter';

  const priceId = plan === 'professional'
    ? process.env.STRIPE_PRICE_ID_PROFESSIONAL
    : process.env.STRIPE_PRICE_ID_STARTER || process.env.STRIPE_PRICE_ID;

  // Fail closed: without Stripe configured, checkout is unavailable and the
  // facility subscription state is left exactly as it was.
  if (!process.env.STRIPE_SECRET_KEY || !priceId) {
    return NextResponse.redirect(`${baseUrl}/settings/billing?error=unavailable`, { status: 303 });
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
      allow_promotion_codes: true,
      payment_method_collection: 'if_required',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: { trial_period_days: 30 },
      success_url: `${baseUrl}/settings/billing?success=1`,
      cancel_url: `${baseUrl}/settings/billing?canceled=1`,
      metadata: { facilityId, plan },
    });

    return NextResponse.redirect(checkoutSession.url || `${baseUrl}/settings/billing?error=checkout`, { status: 303 });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return NextResponse.redirect(`${baseUrl}/settings/billing?error=checkout`, { status: 303 });
  }
}
