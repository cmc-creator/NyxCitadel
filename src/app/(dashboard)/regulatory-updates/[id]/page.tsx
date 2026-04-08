import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import {
  ArrowLeft, ExternalLink, AlertTriangle, Info,
  ArrowUpCircle, CheckCircle2,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

const IMPACT_STYLES: Record<string, { badge: string; bg: string; icon: React.ElementType; label: string }> = {
  CRITICAL:      { badge: 'bg-red-500/15 text-red-400 border border-red-500/30',          bg: 'bg-red-950/30 border-red-700/40',       icon: AlertTriangle,  label: 'Critical - Immediate Action Required' },
  HIGH:          { badge: 'bg-orange-500/15 text-orange-400 border border-orange-500/30',  bg: 'bg-orange-950/30 border-orange-700/40', icon: ArrowUpCircle,  label: 'High Priority - Review Within 7 Days' },
  MEDIUM:        { badge: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',     bg: 'bg-amber-950/20 border-amber-700/40',   icon: Info,           label: 'Medium - Review Within 30 Days' },
  INFORMATIONAL: { badge: 'bg-slate-500/15 text-muted-foreground/70 border border-slate-500/20',     bg: 'bg-slate-800/30 border-slate-700/30',   icon: CheckCircle2,   label: 'Informational - Awareness Only' },
};

export default async function RegulatoryUpdateDetailPage({ params }: { params: { id: string } }) {
  const update = await prisma.regulatoryUpdate.findUnique({
    where: { id: params.id },
  });

  if (!update) notFound();

  const style = IMPACT_STYLES[update.urgency] ?? IMPACT_STYLES.INFORMATIONAL;
  const Icon  = style.icon;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Back */}
      <Link href="/regulatory-updates" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Regulatory Updates
      </Link>

      {/* Impact banner */}
      <div className={`flex items-start gap-3 p-4 rounded-xl border ${style.bg}`}>
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5 text-current" />
        <p className="text-sm font-semibold">{style.label}</p>
      </div>

      {/* Main card */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${style.badge}`}>
              {update.urgency}
            </span>
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
              {update.regulatoryBody}
            </span>
          </div>
          <h1 className="text-xl font-bold text-foreground leading-snug">{update.title}</h1>
        </div>

        {/* Meta row */}
        <div className="px-6 py-3 border-b border-border bg-muted/30 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span>Published {formatDate(update.createdAt, 'MMMM d, yyyy')}</span>
          {update.sourceUrl && (
            <a
              href={update.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-teal-400 hover:text-teal-300 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Official Source
            </a>
          )}
        </div>

        {/* Summary */}
        <div className="px-6 py-5">
          {update.summary ? (
            <div className="prose prose-sm prose-invert max-w-none">
              {update.summary.split('\n').map((line, i) => (
                <p key={i} className="text-sm text-foreground/90 leading-relaxed mb-3 last:mb-0">{line}</p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No summary available.</p>
          )}
        </div>
      </div>
    </div>
  );
}