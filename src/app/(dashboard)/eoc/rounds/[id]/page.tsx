import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, ClipboardCheck , Pencil } from 'lucide-react';
import PrintButton from '@/components/ui/PrintButton';

export const dynamic = 'force-dynamic';

const STATUS_COLOR: Record<string, string> = {
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  REVIEWED: 'bg-teal-50 text-teal-700',
  APPROVED: 'bg-emerald-100 text-emerald-800',
};

const DEF_SEVERITY_COLOR: Record<string, string> = {
  IMMEDIATE_JEOPARDY: 'bg-red-600 text-white',
  HIGH: 'bg-red-100 text-red-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  LOW: 'bg-green-100 text-green-800',
  OBSERVATION: 'bg-slate-100 text-slate-600',
};

const DEF_STATUS_COLOR: Record<string, string> = {
  OPEN: 'bg-red-100 text-red-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  RESOLVED: 'bg-green-100 text-green-800',
  VERIFIED: 'bg-emerald-100 text-emerald-800',
  ACCEPTED: 'bg-gray-100 text-gray-600',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">{title}</h2>
      {children}
    </div>
  );
}

export default async function EocRoundDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect('/login');

  const round = await prisma.eocRound.findUnique({
    where: { id: params.id },
    include: { deficiencies: { orderBy: [{ severity: 'asc' }, { createdAt: 'asc' }] } },
  });

  if (!round || round.facilityId !== session.user.facilityId) notFound();

  const openDefs = round.deficiencies.filter(d => d.status === 'OPEN' || d.status === 'IN_PROGRESS');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/eoc/rounds" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-foreground transition">
          <ArrowLeft className="w-4 h-4" /> Back to EOC Rounds
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/eoc/rounds/${params.id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-foreground/80 rounded-lg font-medium transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Link>
          <PrintButton />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <ClipboardCheck className="w-5 h-5 text-teal-600" />
              <span className="text-xs font-mono text-muted-foreground/70">{round.roundNumber}</span>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLOR[round.status] ?? 'bg-slate-100 text-slate-600'}`}>
                {round.status.replace(/_/g, ' ')}
              </span>
            </div>
            <h1 className="text-xl font-bold text-foreground">{round.roundType.replace(/_/g, ' ')}</h1>
            <p className="text-sm text-slate-500 mt-1">
              Conducted: <strong>{formatDate(round.conductedDate)}</strong>
              &middot; By: <strong>{round.conductedBy}</strong>
            </p>
          </div>
          <div className="flex gap-4 text-center shrink-0">
            <div className="bg-slate-50 rounded-xl px-4 py-2">
              <p className="text-2xl font-bold text-foreground">{round.totalItems}</p>
              <p className="text-xs text-muted-foreground/70">Total Items</p>
            </div>
            <div className={`rounded-xl px-4 py-2 ${openDefs.length > 0 ? 'bg-red-950/20' : 'bg-green-50'}`}>
              <p className={`text-2xl font-bold ${openDefs.length > 0 ? 'text-red-700' : 'text-green-700'}`}>{openDefs.length}</p>
              <p className="text-xs text-muted-foreground/70">Open Deficiencies</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          <Section title={`Deficiencies Found (${round.deficiencies.length})`}>
            {round.deficiencies.length === 0 ? (
              <p className="text-sm text-muted-foreground/70">No deficiencies recorded for this round.</p>
            ) : (
              <div className="divide-y divide-border/30">
                {round.deficiencies.map(def => (
                  <div key={def.id} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-mono text-muted-foreground/70">{def.defNumber}</span>
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${DEF_SEVERITY_COLOR[def.severity] ?? 'bg-slate-100 text-slate-600'}`}>
                            {def.severity.replace(/_/g, ' ')}
                          </span>
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${DEF_STATUS_COLOR[def.status] ?? 'bg-slate-100 text-slate-600'}`}>
                            {def.status}
                          </span>
                        </div>
                        <p className="text-sm text-foreground/80">{def.description}</p>
                        <p className="text-xs text-muted-foreground/70 mt-0.5">{def.location}{def.unit && ` · ${def.unit}`}</p>
                      </div>
                    </div>
                    {def.dueDate && (
                      <p className="text-xs text-muted-foreground/70 mt-1">Due: {formatDate(def.dueDate)}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Section>

          {round.summary && (
            <Section title="Summary">
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">{round.summary}</p>
            </Section>
          )}
        </div>

        <div className="space-y-5">
          <Section title="Round Details">
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-muted-foreground/70">Round Type</dt>
                <dd className="text-sm font-medium text-foreground mt-0.5">{round.roundType.replace(/_/g, ' ')}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground/70">Conducted Date</dt>
                <dd className="text-sm font-medium text-foreground mt-0.5">{formatDate(round.conductedDate)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground/70">Conducted By</dt>
                <dd className="text-sm font-medium text-foreground mt-0.5">{round.conductedBy}</dd>
              </div>
              {round.areasInspected.length > 0 && (
                <div>
                  <dt className="text-xs text-muted-foreground/70">Areas Inspected</dt>
                  <dd className="text-sm font-medium text-foreground mt-0.5">{round.areasInspected.join(', ')}</dd>
                </div>
              )}
            </dl>
          </Section>
        </div>
      </div>
    </div>
  );
}
