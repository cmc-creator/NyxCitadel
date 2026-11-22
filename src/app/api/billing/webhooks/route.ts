import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

// The plan a facility bought, read from the checkout session metadata.
// Anything other than the two known plan names is ignored.
function planFromSession(session: Stripe.Checkout.Session): string | null {
  const plan = session.metadata?.plan;
  return plan === 'starter' || plan === 'professional' ? plan : null;
}

// Self-heal path for subscriptions that predate plan persistence: map the
// subscription's price id back to a plan using the same env vars the
// checkout route uses. Runs on the Stripe object already in hand, so it
// needs no extra API permission. Returns null for unrecognized prices.
function planFromPriceId(priceId: string | undefined | null): string | null {
  if (!priceId) return null;
  if (process.env.STRIPE_PRICE_ID_PROFESSIONAL && priceId === process.env.STRIPE_PRICE_ID_PROFESSIONAL) {
    return 'professional';
  }
  const starterPrice = process.env.STRIPE_PRICE_ID_STARTER || process.env.STRIPE_PRICE_ID;
  if (starterPrice && priceId === starterPrice) return 'starter';
  return null;
}

// Stripe retries events for days, and a retry can land after the state it
// describes has been superseded: a retried checkout.session.completed once
// rewrote a canceled facility back to trialing. An event is stale when the
// facility is canceled with no stored subscription and the event predates
// the facility's last update (the cancellation). A genuinely new checkout
// after a cancellation creates a newer event, so it is not blocked.
function isStaleForCanceledFacility(
  event: Stripe.Event,
  facility: { subscriptionStatus: string | null; stripeSubscriptionId: string | null; updatedAt: Date },
): boolean {
  return (
    facility.subscriptionStatus === 'canceled' &&
    !facility.stripeSubscriptionId &&
    event.created * 1000 <= facility.updatedAt.getTime()
  );
}

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Billing not configured' }, { status: 503 });
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-04-22.dahlia' });

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
        const facility = await prisma.facility.findUnique({ where: { id: facilityId } });
        if (!facility) break;
        if (isStaleForCanceledFacility(event, facility)) break;
        const plan = planFromSession(session);
        await prisma.facility.update({
          where: { id: facilityId },
          data: {
            stripeCustomerId: typeof session.customer === 'string' ? session.customer : session.customer?.id,
            stripeSubscriptionId: session.subscription as string,
            subscriptionStatus: 'trialing',
            ...(plan ? { subscriptionPlan: plan } : {}),
          },
        });
        break;
      }

      case 'customer.subscription.created': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
        const facility =
          (sub.metadata?.facilityId
            ? await prisma.facility.findUnique({ where: { id: sub.metadata.facilityId } })
            : null) ??
          (await prisma.facility.findFirst({ where: { stripeCustomerId: customerId } }));
        if (!facility) break;
        if (isStaleForCanceledFacility(event, facility)) break;
        const plan = planFromPriceId(sub.items?.data?.[0]?.price?.id);
        await prisma.facility.update({
          where: { id: facility.id },
          data: {
            stripeSubscriptionId: sub.id,
            subscriptionStatus: sub.status,
            trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
            currentPeriodEnd: sub.items?.data?.[0]?.current_period_end
              ? new Date(sub.items.data[0].current_period_end * 1000)
              : null,
            ...(plan && plan !== facility.subscriptionPlan ? { subscriptionPlan: plan } : {}),
          },
        });
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const facility = await prisma.facility.findFirst({ where: { stripeSubscriptionId: sub.id } });
        if (!facility) break;
        const plan = planFromPriceId(sub.items?.data?.[0]?.price?.id);
        await prisma.facility.update({
          where: { id: facility.id },
          data: {
            subscriptionStatus: sub.status,
            trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
            currentPeriodEnd: sub.items?.data?.[0]?.current_period_end
              ? new Date(sub.items.data[0].current_period_end * 1000)
              : null,
            ...(plan && plan !== facility.subscriptionPlan ? { subscriptionPlan: plan } : {}),
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
          data: {
            subscriptionStatus: 'canceled',
            stripeSubscriptionId: null,
          },
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
