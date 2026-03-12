import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Inbox, CheckCircle2, Clock, Building2, Mail, Phone, Users } from 'lucide-react';
import DemoRequestActions from './DemoRequestActions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Demo Requests' };

export default async function DemoRequestsPage() {
  const session = await auth();
  if (!['ADMIN', 'SUPER_ADMIN'].includes(session?.user?.role ?? '')) redirect('/settings');

  const requests = await prisma.demoRequest.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const pending  = requests.filter(r => !r.reviewed);
  const reviewed = requests.filter(r =>  r.reviewed);

  function fmtDate(d: Date) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  }

  const FACILITY_TYPE_LABELS: Record<string, string> = {
    acute_psych: 'Acute Psychiatric',
    residential: 'Residential BH',
    crisis:      'Crisis Stabilization',
    outpatient:  'Outpatient / PHP',
    ltach:       'LTACH / SNF',
    other:       'Other',
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Inbox className="w-6 h-6 text-purple-400" />
            Demo / Access Requests
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Inbound requests from the /signup page. {pending.length} pending review.
          </p>
        </div>
        <div className="flex gap-3 text-sm">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/40 text-amber-400 border border-amber-700/40">
            <Clock className="w-3.5 h-3.5" /> {pending.length} pending
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-700/40">
            <CheckCircle2 className="w-3.5 h-3.5" /> {reviewed.length} reviewed
          </span>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
          <Inbox className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No demo requests yet. They'll appear here when facilities submit via /signup.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {[{ label: 'Pending Review', items: pending, accent: 'border-amber-700/40 bg-amber-950/10' },
            { label: 'Reviewed',      items: reviewed, accent: 'border-border bg-card' }].map(group => (
            group.items.length > 0 && (
              <section key={group.label}>
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {group.label} ({group.items.length})
                </h2>
                <div className="space-y-2">
                  {group.items.map(r => (
                    <div key={r.id} className={`rounded-xl border p-4 ${group.accent}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-foreground text-sm">{r.name}</span>
                            {r.facilityType && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-950/40 text-purple-300 border border-purple-700/40">
                                {FACILITY_TYPE_LABELS[r.facilityType] ?? r.facilityType}
                              </span>
                            )}
                            {r.beds && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Users className="w-3 h-3" /> {r.beds} beds
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" /> {r.facilityName}
                            </span>
                            <a href={`mailto:${r.email}`} className="flex items-center gap-1 hover:text-purple-400">
                              <Mail className="w-3 h-3" /> {r.email}
                            </a>
                            {r.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" /> {r.phone}
                              </span>
                            )}
                          </div>
                          {r.message && (
                            <p className="text-xs text-muted-foreground italic line-clamp-2 bg-slate-900/40 rounded p-2 border border-border/50">
                              "{r.message}"
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground/50">Submitted {fmtDate(r.createdAt)}</p>
                        </div>
                        <DemoRequestActions id={r.id} reviewed={r.reviewed} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )
          ))}
        </div>
      )}
    </div>
  );
}
