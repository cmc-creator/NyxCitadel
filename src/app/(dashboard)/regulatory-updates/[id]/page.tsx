import React from 'react';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import {
  ArrowLeft, ExternalLink, AlertTriangle, Info,
  ArrowUpCircle, CheckCircle2, Tag, Zap,
} from 'lucide-react';
import { AckButton } from '@/components/regulatory/AckButton';

export const dynamic = 'force-dynamic';

const IMPACT_STYLES: Record<string, { badge: string; bg: string; icon: React.ElementType; label: string }> = {
  CRITICAL:      { badge: 'bg-red-500/15 text-red-400 border border-red-500/30',          bg: 'bg-red-950/30 border-red-700/40',       icon: AlertTriangle,  label: 'Critical - Immediate Action Required' },
  HIGH:          { badge: 'bg-orange-500/15 text-orange-400 border border-orange-500/30',  bg: 'bg-orange-950/30 border-orange-700/40', icon: ArrowUpCircle,  label: 'High Priority - Review Within 7 Days' },
  MEDIUM:        { badge: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',     bg: 'bg-amber-950/20 border-amber-700/40',   icon: Info,           label: 'Medium - Review Within 30 Days' },
  INFORMATIONAL: { badge: 'bg-slate-500/15 text-muted-foreground/70 border border-slate-500/20', bg: 'bg-slate-800/30 border-border/30', icon: CheckCircle2,   label: 'Informational - Awareness Only' },
};

export default async function RegulatoryUpdateDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect('/login');

  const [update, ack] = await Promise.all([
    prisma.regulatoryUpdate.findUnique({
      where: { id: params.id },
      include: {
        publishedBy: { select: { name: true } },
        _count: { select: { acknowledgments: true } },
      },
    }),
    prisma.regulatoryUpdateAck.findUnique({
      where: { updateId_userId: { updateId: params.id, userId: session.user.id } },
      select: { ackedAt: true },
    }),
  ]);

  if (!update) notFound();

  const style = IMPACT_STYLES[update.urgency] ?? IMPACT_STYLES.INFORMATIONAL;
  const Icon  = style.icon;
  const isAcked = !!ack;
  const affectedAreas = (update.affectedAreas ?? []) as string[];

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
            {update.standardRef && (
              <span className="text-xs font-mono text-muted-foreground/70 bg-muted/50 px-2 py-0.5 rounded">
                {update.standardRef}
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold text-foreground leading-snug">{update.title}</h1>
        </div>

        {/* Meta row */}
        <div className="px-6 py-3 border-b border-border bg-muted/30 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span>Published {formatDate(update.createdAt, 'MMMM d, yyyy')}</span>
          {update.effectiveDate && (
            <span className="text-amber-400/80">Effective {formatDate(update.effectiveDate, 'MMMM d, yyyy')}</span>
          )}
          {update.publishedBy?.name && <span>By {update.publishedBy.name}</span>}
          <span>{update._count.acknowledgments} staff acknowledged</span>
          {update.sourceUrl && (
            <a
              href={update.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Official Source
            </a>
          )}
        </div>

        {/* Summary */}
        <div className="px-6 py-5 border-b border-border">
          {update.summary ? (
            <div>
              {update.summary.split('\n').map((line, i) => (
                <p key={i} className="text-sm text-foreground/90 leading-relaxed mb-3 last:mb-0">{line}</p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No summary available.</p>
          )}
        </div>

        {/* Full body */}
        {update.body && (
          <div className="px-6 py-5 border-b border-border">
            {update.body.split('\n').map((line, i) => (
              <p key={i} className="text-sm text-foreground/80 leading-relaxed mb-2 last:mb-0">{line}</p>
            ))}
          </div>
        )}

        {/* Action Required */}
        {update.actionRequired && (
          <div className="px-6 py-4 border-b border-border bg-amber-950/20">
            <p className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
              <Zap className="w-3.5 h-3.5" /> Action Required
            </p>
            {update.actionRequired.split('\n').map((line, i) => (
              <p key={i} className="text-sm text-amber-100/80 leading-relaxed mb-1.5 last:mb-0">{line}</p>
            ))}
          </div>
        )}

        {/* Affected Areas */}
        {affectedAreas.length > 0 && (
          <div className="px-6 py-4 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Tag className="w-3.5 h-3.5" /> Affected Areas
            </p>
            <div className="flex flex-wrap gap-1.5">
              {affectedAreas.map((area) => (
                <span key={area} className="text-xs px-2.5 py-1 rounded-lg bg-muted/40 border border-border/60 text-foreground/80 font-medium">
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Acknowledge */}
        <div className="px-6 py-4">
          <AckButton updateId={params.id} initialAcked={isAcked} ackedAt={ack?.ackedAt?.toISOString() ?? null} />
        </div>
      </div>
    </div>
  );
}