import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isStoreShell } from '@/lib/shell';
import { redirect } from 'next/navigation';
import { CreditCard, CheckCircle2, AlertTriangle, Clock, XCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Billing' };

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: typeof CheckCircle2 }> = {
  trialing:  { label: 'Free Trial',        cls: 'bg-blue-950/30 text-blue-300 border-blue-700/40',    icon: Clock },
  active:    { label: 'Active',            cls: 'bg-emerald-950/30 text-emerald-300 border-emerald-700/40', icon: CheckCircle2 },
  past_due:  { label: 'Payment Past Due',  cls: 'bg-amber-950/30 text-amber-300 border-amber-700/40', icon: AlertTriangle },
  canceled:  { label: 'Canceled',          cls: 'bg-red-950/30 text-red-300 border-red-700/40',       icon: XCircle },
};

export default async function BillingPage({ searchParams }: { searchParams: { success?: string; canceled?: string; reason?: string; error?: string } }) {
  const session = await auth();
  if (!session?.user?.facilityId) redirect('/login');

  const facilityId = session.user.facilityId;

  const facility = await prisma.facility.findUnique({
    where: { id: facilityId },
    select: {
      name: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      subscriptionStatus: true,
      trialEndsAt: true,
      currentPeriodEnd: true,
    },
  });

  if (!facility) redirect('/login');

  const status = facility.subscriptionStatus ?? 'trialing';
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.trialing;
  const Icon = cfg.icon;
  const hasSubscription = !!facility.stripeSubscriptionId;
  // Store shells hide every purchase entry point on this page (plans are
  // sold on the web only); the plan status display still renders.
  const storeShell = isStoreShell();

  function fmt(d: Date | null) {
    if (!d) return null;
    return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-citadel-gold-dark" />
          Billing
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your NyxCitadel subscription for {facility.name}.</p>
      </div>

      {searchParams.success && (
        <div className="bg-emerald-950/30 border border-emerald-700/40 rounded-xl px-5 py-4 flex items-center gap-3 text-sm text-emerald-300">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          Subscription activated! Your 30-day free trial has started.
        </div>
      )}

      {searchParams.canceled && (
        <div className="bg-amber-950/20 border border-amber-700/30 rounded-xl px-5 py-4 flex items-center gap-3 text-sm text-amber-300">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          Checkout was canceled. Your subscription has not changed.
        </div>
      )}

      {searchParams.error === 'unavailable' && (
        <div className="bg-red-950/30 border border-red-700/50 rounded-xl px-5 py-4 flex items-center gap-3 text-sm text-red-300">
          <XCircle className="w-5 h-5 flex-shrink-0" />
          Billing is not available right now. Please contact us to set up your subscription.
        </div>
      )}

      {searchParams.error === 'enterprise' && (
        <div className="bg-amber-950/20 border border-amber-700/30 rounded-xl px-5 py-4 flex items-center gap-3 text-sm text-amber-300">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          Enterprise plans are set up by our team. Please contact us and we will get you started.
        </div>
      )}

      {searchParams.error === 'checkout' && (
        <div className="bg-red-950/30 border border-red-700/50 rounded-xl px-5 py-4 flex items-center gap-3 text-sm text-red-300">
          <XCircle className="w-5 h-5 flex-shrink-0" />
          Checkout could not be started. Please try again, or contact us if it keeps happening.
        </div>
      )}

      {searchParams.reason === 'canceled' && (
        <div className="bg-red-950/30 border border-red-700/50 rounded-xl px-5 py-4 flex items-center gap-3 text-sm text-red-300">
          <XCircle className="w-5 h-5 flex-shrink-0" />
          {storeShell
            ? 'Your subscription has been canceled. Please contact the NyxCitadel team to restore access.'
            : 'Your subscription has been canceled. Reactivate to regain access.'}
        </div>
      )}

      {/* Plan card */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Current Plan</p>
            <p className="text-xl font-bold text-foreground">NyxCitadel Subscription</p>
            <p className="text-sm text-muted-foreground mt-1">
              {storeShell
                ? 'Your facility plan is shown here. Billing is managed by the NyxCitadel team.'
                : 'Plans start at $399/month, billed monthly. Compare the plans below.'}
            </p>
          </div>
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${cfg.cls}`}>
            <Icon className="w-3.5 h-3.5" />
            {cfg.label}
          </span>
        </div>

        <div className="border-t border-border/30 pt-4 space-y-2 text-sm text-muted-foreground">
          {status === 'trialing' && facility.trialEndsAt && (
            <p>Trial ends <span className="text-foreground font-medium">{fmt(facility.trialEndsAt)}</span></p>
          )}
          {status === 'active' && facility.currentPeriodEnd && (
            <p>Next billing date: <span className="text-foreground font-medium">{fmt(facility.currentPeriodEnd)}</span></p>
          )}
          {status === 'past_due' && (
            <p className="text-amber-400">Payment failed. Please update your payment method to avoid service interruption.</p>
          )}
        </div>

        {hasSubscription && !storeShell ? (
          <div className="flex gap-3 pt-1">
            <form action="/api/billing/portal" method="POST">
              <button
                type="submit"
                className="inline-flex items-center gap-2 border border-border hover:bg-muted/30 text-foreground/80 text-sm font-medium px-5 py-2.5 rounded-lg transition"
              >
                <CreditCard className="w-4 h-4" />
                Manage Billing
              </button>
            </form>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground pt-1">
            {storeShell
              ? 'Plan and billing changes for your facility are handled by the NyxCitadel team.'
              : 'No active subscription yet. Pick a plan below to start, with 30 days free.'}
          </p>
        )}
      </div>

      {/* Plans: in store shells the plan cards and their Start buttons are
          replaced with a neutral note, since plans are not sold in the app */}
      {storeShell ? (
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-semibold text-foreground mb-2">Plans</h2>
          <p className="text-sm text-muted-foreground">
            NyxCitadel plans are set up by our team for each facility. To change plans,
            contact the NyxCitadel team and we will take care of it.
          </p>
        </div>
      ) : (
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-4">Plans</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-card border border-border rounded-xl p-6 flex flex-col">
            <p className="text-base font-bold text-foreground">Starter</p>
            <p className="text-sm text-muted-foreground mt-0.5">Everything you need to stay survey-ready.</p>
            <p className="text-3xl font-black text-citadel-gold mt-3">$399<span className="text-sm font-normal text-muted-foreground">/month</span></p>
            <ul className="space-y-1.5 text-sm text-muted-foreground mt-4 flex-1">
              <li>1 facility</li>
              <li>Up to 5 users</li>
              <li>Compliance calendar and tracker</li>
              <li>Policy and procedure management</li>
              <li>Incident management and CAPs</li>
              <li>Basic reporting and exports</li>
            </ul>
            {!hasSubscription && (
              <form action="/api/billing/checkout" method="POST" className="mt-5">
                <input type="hidden" name="plan" value="starter" />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-citadel-gold-dark hover:bg-citadel-gold text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition w-full justify-center"
                >
                  <CreditCard className="w-4 h-4" />
                  Start Starter - 30 days free
                </button>
              </form>
            )}
          </div>

          <div className="bg-card border border-citadel-gold/60 rounded-xl p-6 flex flex-col">
            <p className="text-base font-bold text-foreground">Professional</p>
            <p className="text-sm text-muted-foreground mt-0.5">The full platform - built for quality teams.</p>
            <p className="text-3xl font-black text-citadel-gold mt-3">$799<span className="text-sm font-normal text-muted-foreground">/month</span></p>
            <ul className="space-y-1.5 text-sm text-muted-foreground mt-4 flex-1">
              <li>Up to 3 facilities</li>
              <li>Up to 20 users</li>
              <li>Everything in Starter</li>
              <li>QAPI and performance improvement</li>
              <li>Emergency preparedness suite</li>
              <li>Survey management and POCs</li>
              <li>Sentry AI assistant</li>
              <li>Executive and board dashboards</li>
            </ul>
            {!hasSubscription && (
              <form action="/api/billing/checkout" method="POST" className="mt-5">
                <input type="hidden" name="plan" value="professional" />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-citadel-gold-dark hover:bg-citadel-gold text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition w-full justify-center"
                >
                  <CreditCard className="w-4 h-4" />
                  Start Professional - 30 days free
                </button>
              </form>
            )}
          </div>

          <div className="bg-card border border-border rounded-xl p-6 flex flex-col">
            <p className="text-base font-bold text-foreground">Enterprise</p>
            <p className="text-sm text-muted-foreground mt-0.5">Unlimited scale. Dedicated support. Fully custom.</p>
            <p className="text-3xl font-black text-citadel-gold mt-3">Custom</p>
            <ul className="space-y-1.5 text-sm text-muted-foreground mt-4 flex-1">
              <li>Unlimited facilities</li>
              <li>Unlimited users</li>
              <li>Everything in Professional</li>
              <li>White-label branding</li>
              <li>Dedicated compliance consultant</li>
              <li>Priority 24/7 support</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-5">Contact us for pricing and setup.</p>
          </div>
        </div>
      </div>
      )}

      {/* What's included */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">What&apos;s Included</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {[
            'Unlimited compliance tracking (incidents, CAPs, policies, training)',
            'Board-ready reporting and export center',
            'Sentry AI compliance assistant',
            'Scheduling lockout enforcement',
            'Multi-role access (admin, staff, compliance officer)',
            'Audit logging and HIPAA-adjacent tooling',
            'Emergency management and drill tracking',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-citadel-gold flex-shrink-0 mt-0.5" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
