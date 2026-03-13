import React from 'react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import {
  Newspaper, ExternalLink, AlertTriangle, Info,
  ArrowUpCircle, CheckCircle2, Plus,
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Regulatory Updates' };

const URGENCY_STYLES: Record<string, { badge: string; icon: React.ElementType; bar: string }> = {
  CRITICAL:      { badge: 'bg-red-500/15 text-red-400 border border-red-500/30',       icon: AlertTriangle,  bar: 'bg-red-500' },
  HIGH:          { badge: 'bg-orange-500/15 text-orange-400 border border-orange-500/30', icon: ArrowUpCircle,  bar: 'bg-orange-500' },
  MEDIUM:        { badge: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',  icon: Info,           bar: 'bg-amber-500' },
  INFORMATIONAL: { badge: 'bg-slate-500/15 text-slate-400 border border-slate-500/20',  icon: CheckCircle2,   bar: 'bg-slate-500' },
};

const URGENCY_LABEL: Record<string, string> = {
  CRITICAL:      'Critical — Act Now',
  HIGH:          'High Priority',
  MEDIUM:        'Medium',
  INFORMATIONAL: 'Informational',
};

export default async function RegulatoryUpdatesPage() {
  const session = await auth();
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes((session?.user as any)?.role ?? '');

  const updates = await prisma.regulatoryUpdate.findMany({
    where: { isActive: true },
    orderBy: [{ urgency: 'asc' }, { createdAt: 'desc' }],
    include: { publishedBy: { select: { name: true } } },
  });

  const critical = updates.filter(u => u.urgency === 'CRITICAL');
  const rest     = updates.filter(u => u.urgency !== 'CRITICAL');

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-purple-400" />
            Regulatory Updates
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Admin-curated feed of regulatory changes, new guidance, and compliance mandates. Publishing an update notifies all users instantly.
          </p>
        </div>
        {isAdmin && (
          <Link
            href="/regulatory-updates/new"
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-lg shadow-purple-500/20"
          >
            <Plus className="w-4 h-4" /> Publish Update
          </Link>
        )}
      </div>

      {/* Critical banner */}
      {critical.length > 0 && (
        <div className="bg-red-950/30 border border-red-700/40 rounded-xl p-4 space-y-3">
          <p className="text-xs font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> {critical.length} Critical Update{critical.length !== 1 ? 's' : ''} — Immediate Action Required
          </p>
          {critical.map(u => (
            <Link
              key={u.id}
              href={`/regulatory-updates/${u.id}`}
              className="block bg-red-950/40 hover:bg-red-950/60 border border-red-700/30 rounded-lg px-4 py-3 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-red-300">{u.title}</p>
                  <p className="text-xs text-red-400/80 mt-0.5">{u.summary.slice(0, 160)}{u.summary.length > 160 ? '…' : ''}</p>
                </div>
                <span className="text-xs text-red-500/60 whitespace-nowrap mt-0.5">{formatDate(u.createdAt, 'MMM d, yyyy')}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* All updates */}
      {rest.length === 0 && critical.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
          <Newspaper className="w-10 h-10 opacity-20" />
          <p className="text-sm">No regulatory updates published yet.</p>
          {isAdmin && (
            <Link href="/regulatory-updates/new" className="text-sm text-purple-400 hover:text-purple-300 underline">
              Publish the first update →
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {rest.map(u => {
            const style = URGENCY_STYLES[u.urgency] ?? URGENCY_STYLES.INFORMATIONAL;
            const Icon  = style.icon;
            return (
              <Link
                key={u.id}
                href={`/regulatory-updates/${u.id}`}
                className="block bg-card border border-border hover:border-purple-500/40 rounded-xl overflow-hidden transition-colors group"
              >
                {/* Urgency color bar */}
                <div className={`h-0.5 w-full ${style.bar}`} />
                <div className="px-5 py-4 flex items-start gap-4">
                  <div className={`mt-0.5 p-1.5 rounded-lg ${style.badge} flex-shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${style.badge}`}>
                        {URGENCY_LABEL[u.urgency]}
                      </span>
                      <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {u.regulatoryBody}
                      </span>
                      {u.standardRef && (
                        <span className="text-[10px] text-muted-foreground font-mono">{u.standardRef}</span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-foreground group-hover:text-purple-300 transition-colors truncate">
                      {u.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{u.summary}</p>
                  </div>
                  <div className="text-right flex-shrink-0 space-y-1">
                    <p className="text-xs text-muted-foreground">{formatDate(u.createdAt, 'MMM d, yyyy')}</p>
                    {u.effectiveDate && (
                      <p className="text-[10px] text-amber-400">Effective {formatDate(u.effectiveDate, 'MMM d, yyyy')}</p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
