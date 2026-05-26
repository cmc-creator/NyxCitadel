import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-04-22.dahlia' });

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Stripe webhook signature error:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const facilityId = session.metadata?.facilityId;
        if (!facilityId || !session.subscription) break;
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        await prisma.facility.update({
          where: { id: facilityId },
          data: {
            stripeSubscriptionId: sub.id,
            subscriptionStatus: sub.status,
            trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
          },
        });
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const facility = await prisma.facility.findFirst({ where: { stripeSubscriptionId: sub.id } });
        if (!facility) break;
        await prisma.facility.update({
          where: { id: facility.id },
          data: {
            subscriptionStatus: sub.status,
            trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
          },
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const facility = await prisma.facility.findFirst({ where: { stripeSubscriptionId: sub.id } });
        if (!facility) break;
        await prisma.facility.update({
          where: { id: facility.id },
          data: { subscriptionStatus: 'canceled' },
        });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = invoice.parent?.subscription_details?.subscription;
        if (!subId) break;
        const subIdStr = typeof subId === 'string' ? subId : subId.id;
        const facility = await prisma.facility.findFirst({ where: { stripeSubscriptionId: subIdStr } });
        if (!facility) break;
        await prisma.facility.update({
          where: { id: facility.id },
          data: { subscriptionStatus: 'past_due' },
        });
        break;
      }
    }
  } catch (err) {
    console.error('Stripe webhook handler error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
