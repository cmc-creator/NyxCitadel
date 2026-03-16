import React from 'react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import {
  Newspaper, AlertTriangle, Info,
  ArrowUpCircle, CheckCircle2,
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Regulatory Updates' };

const IMPACT_STYLES: Record<string, { badge: string; icon: React.ElementType; bar: string; label: string }> = {
  CRITICAL: { badge: 'bg-red-500/15 text-red-400 border border-red-500/30',         icon: AlertTriangle,  bar: 'bg-red-500',    label: 'Critical - Act Now' },
  HIGH:     { badge: 'bg-orange-500/15 text-orange-400 border border-orange-500/30', icon: ArrowUpCircle,  bar: 'bg-orange-500', label: 'High Priority' },
  MEDIUM:   { badge: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',    icon: Info,           bar: 'bg-amber-500',  label: 'Medium' },
  LOW:      { badge: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',       icon: CheckCircle2,   bar: 'bg-blue-500',   label: 'Low Impact' },
  INFO:     { badge: 'bg-slate-500/15 text-slate-400 border border-slate-500/20',    icon: CheckCircle2,   bar: 'bg-slate-500',  label: 'Informational' },
};

const IMPACT_ORDER = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];

export default async function RegulatoryUpdatesPage() {
  const updates = await prisma.regulatoryUpdate.findMany({
    where: { isGlobal: true },
    orderBy: [{ publishedAt: 'desc' }],
    take: 100,
  });

  // Sort client-side by impact level priority
  const sorted = [...updates].sort((a, b) => {
    const ai = IMPACT_ORDER.indexOf(a.impactLevel);
    const bi = IMPACT_ORDER.indexOf(b.impactLevel);
    if (ai !== bi) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  const critical = sorted.filter(u => u.impactLevel === 'CRITICAL');
  const rest     = sorted.filter(u => u.impactLevel !== 'CRITICAL');

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
            Latest regulatory changes, new guidance, and compliance mandates from CMS, Joint Commission, AZ ADHS, and other bodies.
          </p>
        </div>
      </div>

      {/* Critical banner */}
      {critical.length > 0 && (
        <div className="bg-red-950/30 border border-red-700/40 rounded-xl p-4 space-y-3">
          <p className="text-xs font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> {critical.length} Critical Update{critical.length !== 1 ? 's' : ''} - Immediate Action Required
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
                  {u.summary && (
                    <p className="text-xs text-red-400/80 mt-0.5">{u.summary.slice(0, 160)}{u.summary.length > 160 ? '…' : ''}</p>
                  )}
                </div>
                <span className="text-xs text-red-500/60 whitespace-nowrap mt-0.5">{formatDate(u.publishedAt, 'MMM d, yyyy')}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* All updates */}
      {rest.length === 0 && critical.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
          <Newspaper className="w-10 h-10 opacity-20" />
          <p className="text-sm">No regulatory updates available yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rest.map(u => {
            const style = IMPACT_STYLES[u.impactLevel] ?? IMPACT_STYLES.INFO;
            const Icon  = style.icon;
            return (
              <Link
                key={u.id}
                href={`/regulatory-updates/${u.id}`}
                className="block bg-card border border-border hover:border-purple-500/40 rounded-xl overflow-hidden transition-colors group"
              >
                <div className={`h-0.5 w-full ${style.bar}`} />
                <div className="px-5 py-4 flex items-start gap-4">
                  <div className={`mt-0.5 p-1.5 rounded-lg ${style.badge} flex-shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${style.badge}`}>
                        {style.label}
                      </span>
                      <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {u.agency}
                      </span>
                      {u.docType && (
                        <span className="text-[10px] text-muted-foreground font-mono">{u.docType}</span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-foreground group-hover:text-purple-300 transition-colors truncate">
                      {u.title}
                    </p>
                    {u.summary && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{u.summary}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-muted-foreground">{formatDate(u.publishedAt, 'MMM d, yyyy')}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">{u.source.replace(/_/g, ' ')}</p>
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