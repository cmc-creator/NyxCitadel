import React from 'react';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import {
  ArrowLeft, CheckCircle2, XCircle, AlertTriangle,
  ArrowUpCircle, Info, Users,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'COMPLIANCE_OFFICER'];

// Roles that are expected to acknowledge regulatory updates
const ACK_ROLES = ['ADMIN', 'SUPER_ADMIN', 'COMPLIANCE_OFFICER', 'RISK_MANAGER', 'QUALITY', 'EM_COORDINATOR'];

const URGENCY_BADGE: Record<string, string> = {
  CRITICAL:      'bg-red-500/15 text-red-400 border border-red-500/30',
  HIGH:          'bg-orange-500/15 text-orange-400 border border-orange-500/30',
  MEDIUM:        'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  INFORMATIONAL: 'bg-slate-500/15 text-muted-foreground border border-slate-500/20',
};

const URGENCY_ICON: Record<string, React.ElementType> = {
  CRITICAL:      AlertTriangle,
  HIGH:          ArrowUpCircle,
  MEDIUM:        Info,
  INFORMATIONAL: CheckCircle2,
};

export default async function RegulatoryAcksPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect('/login');

  const role = (session.user as any).role as string;
  if (!ADMIN_ROLES.includes(role)) redirect('/regulatory-updates');

  const update = await prisma.regulatoryUpdate.findUnique({
    where: { id: params.id },
    select: {
      id: true, title: true, urgency: true, regulatoryBody: true, createdAt: true,
      acknowledgments: {
        select: {
          userId: true,
          ackedAt: true,
          notes: true,
          user: { select: { name: true, email: true, role: true, title: true } },
        },
      },
    },
  });

  if (!update) notFound();

  // All users expected to ack
  const expectedUsers = await prisma.user.findMany({
    where: { isActive: true, role: { in: ACK_ROLES as any[] } },
    select: { id: true, name: true, email: true, role: true, title: true },
    orderBy: [{ role: 'asc' }, { name: 'asc' }],
  });

  const ackedMap = new Map(update.acknowledgments.map(a => [a.userId, a]));

  const acked   = expectedUsers.filter(u => ackedMap.has(u.id));
  const pending = expectedUsers.filter(u => !ackedMap.has(u.id));

  const pct = expectedUsers.length > 0
    ? Math.round((acked.length / expectedUsers.length) * 100)
    : 0;

  const UrgencyIcon = URGENCY_ICON[update.urgency] ?? Info;
  const urgencyBadge = URGENCY_BADGE[update.urgency] ?? URGENCY_BADGE.INFORMATIONAL;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Back */}
      <Link
        href={`/regulatory-updates/${params.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Update
      </Link>

      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${urgencyBadge}`}>
            <UrgencyIcon className="w-3.5 h-3.5" />
            {update.urgency}
          </span>
          <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
            {update.regulatoryBody}
          </span>
        </div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Users className="w-5 h-5 text-teal-400 flex-shrink-0" />
          Acknowledgment Report
        </h1>
        <p className="text-sm text-muted-foreground line-clamp-2">{update.title}</p>
      </div>

      {/* Progress bar */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Staff compliance</span>
          <span className="font-semibold text-foreground">
            {acked.length} / {expectedUsers.length} reviewed
            <span className="ml-2 text-teal-400">({pct}%)</span>
          </span>
        </div>
        <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-green-500' : pct >= 50 ? 'bg-teal-500' : 'bg-amber-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Published {formatDate(update.createdAt, 'MMM d, yyyy')} · {pending.length} staff yet to review
        </p>
      </div>

      {/* Pending section */}
      {pending.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <XCircle className="w-4 h-4 text-amber-400" />
            Pending Review
            <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-900/40 text-amber-300 text-[10px] font-bold">{pending.length}</span>
          </h2>
          <div className="space-y-2">
            {pending.map(u => (
              <div
                key={u.id}
                className="flex items-center justify-between gap-3 px-4 py-3 bg-card border border-amber-700/20 rounded-lg"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{u.name ?? u.email}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.title ?? u.role} · {u.email}</p>
                </div>
                <span className="flex-shrink-0 text-xs text-amber-400 font-medium">Not reviewed</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Acked section */}
      {acked.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            Reviewed
            <span className="ml-1 px-2 py-0.5 rounded-full bg-green-900/40 text-green-300 text-[10px] font-bold">{acked.length}</span>
          </h2>
          <div className="space-y-2">
            {acked.map(u => {
              const ackData = ackedMap.get(u.id)!;
              return (
                <div
                  key={u.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 bg-card border border-green-700/20 rounded-lg"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{u.name ?? u.email}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.title ?? u.role} · {u.email}</p>
                    {ackData.notes && (
                      <p className="text-xs text-muted-foreground/70 mt-1 italic line-clamp-1">{ackData.notes}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span className="flex items-center gap-1 text-xs text-green-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Reviewed
                    </span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {formatDate(ackData.ackedAt, 'MMM d, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
