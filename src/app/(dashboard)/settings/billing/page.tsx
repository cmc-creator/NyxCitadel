import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
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

export default async function BillingPage({ searchParams }: { searchParams: { success?: string; canceled?: string; reason?: string } }) {
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

  function fmt(d: Date | null) {
    if (!d) return null;
    return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-teal-600" />
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

      {searchParams.reason === 'canceled' && (
        <div className="bg-red-950/30 border border-red-700/50 rounded-xl px-5 py-4 flex items-center gap-3 text-sm text-red-300">
          <XCircle className="w-5 h-5 flex-shrink-0" />
          Your subscription has been canceled. Reactivate to regain access.
        </div>
      )}

      {/* Plan card */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Current Plan</p>
            <p className="text-xl font-bold text-foreground">NyxCitadel Professional</p>
            <p className="text-2xl font-black text-teal-400 mt-1">$199<span className="text-sm font-normal text-muted-foreground">/month per facility</span></p>
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

        <div className="flex gap-3 pt-1">
          {!hasSubscription ? (
            <form action="/api/billing/checkout" method="POST">
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition"
              >
                <CreditCard className="w-4 h-4" />
                Start Subscription — 30 days free
              </button>
            </form>
          ) : (
            <form action="/api/billing/portal" method="POST">
              <button
                type="submit"
                className="inline-flex items-center gap-2 border border-border hover:bg-muted/30 text-foreground/80 text-sm font-medium px-5 py-2.5 rounded-lg transition"
              >
                <CreditCard className="w-4 h-4" />
                Manage Billing
              </button>
            </form>
          )}
        </div>
      </div>

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
              <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
