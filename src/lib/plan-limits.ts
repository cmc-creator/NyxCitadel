import { prisma } from '@/lib/prisma';

// Per-plan active user caps, resolved from the plan persisted on the
// facility by the billing webhook (see api/billing/webhooks).
//
// - No stored subscription id means trial state (including the demo
//   facility): Professional level, so trials are never blocked.
// - Starter with a live subscription: 5. Professional: 20.
// - Enterprise, or a facility with a subscription but no recognized plan:
//   no cap. A cap check must never guess a plan.
export function userCapForFacility(facility: {
  subscriptionPlan: string | null;
  subscriptionStatus: string | null;
  stripeSubscriptionId: string | null;
}): number | null {
  if (!facility.stripeSubscriptionId) return 20;
  if (facility.subscriptionPlan === 'starter' && facility.subscriptionStatus !== 'canceled') return 5;
  if (facility.subscriptionPlan === 'professional') return 20;
  return null;
}

// Returns the cap when the facility is already at or over it, otherwise
// null. The block fires only at creation or reactivation time, so a
// facility that is over its cap keeps every existing account and sign-in;
// it just cannot add more until it drops below the cap or upgrades.
export async function userCapReached(facilityId: string): Promise<number | null> {
  const facility = await prisma.facility.findUnique({
    where: { id: facilityId },
    select: { subscriptionPlan: true, subscriptionStatus: true, stripeSubscriptionId: true },
  });
  if (!facility) return null;
  const cap = userCapForFacility(facility);
  if (cap === null) return null;
  const count = await prisma.user.count({ where: { facilityId, isActive: true } });
  return count >= cap ? cap : null;
}
