import Link from 'next/link';
import { ClipboardList, CheckCircle2, Clock, AlertTriangle, ChevronRight } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const typeBadge: Record<string, { label: string; color: string }> = {
  LIFE_SAFETY_GENERAL: { label: 'Life Safety', color: 'bg-sky-950/50 text-sky-300 border border-sky-700/40' },
  LIGATURE_RISK: { label: 'Ligature Risk', color: 'bg-amber-950/50 text-amber-300 border border-amber-700/40' },
  FIRE_SAFETY: { label: 'Fire Safety', color: 'bg-red-950/50 text-red-300 border border-red-700/40' },
  INFECTION_CONTROL: { label: 'Infection Control', color: 'bg-teal-950/50 text-teal-300 border border-teal-700/40' },
  SECURITY: { label: 'Security', color: 'bg-teal-950/50 text-teal-300 border border-teal-700/40' },
  UTILITIES: { label: 'Utilities', color: 'bg-orange-950/50 text-orange-300 border border-orange-700/40' },
  PATIENT_ENVIRONMENT: { label: 'Patient Environment', color: 'bg-emerald-950/50 text-emerald-300 border border-emerald-700/40' },
  EOC_COMMITTEE: { label: 'EOC Committee', color: 'bg-teal-950/50 text-teal-300 border border-teal-700/40' },
};

const TYPE_LABELS: Record<string, string> = {
  LIFE_SAFETY_GENERAL: 'Life Safety Round',
  LIGATURE_RISK: 'Ligature Risk Survey',
  FIRE_SAFETY: 'Fire Safety Inspection',
  INFECTION_CONTROL: 'Infection Control Round',
  SECURITY: 'Security Round',
  UTILITIES: 'Utilities Inspection',
  PATIENT_ENVIRONMENT: 'Patient Environment Round',
  EOC_COMMITTEE: 'EOC Committee Meeting',
};

const statusBadge: Record<string, string> = {
  IN_PROGRESS: 'bg-amber-950/40 text-amber-400',
  COMPLETED: 'bg-sky-950/40 text-sky-400',
  REVIEWED: 'bg-emerald-950/40 text-emerald-400',
  APPROVED: 'bg-teal-950/40 text-teal-400',
};

const statusIcon: Record<string, React.ElementType> = {
  IN_PROGRESS: Clock,
  COMPLETED: ClipboardList,
  REVIEWED: CheckCircle2,
  APPROVED: CheckCircle2,
};

export default async function EocRoundsPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const rounds = await prisma.eocRound.findMany({
    where: { facilityId },
    orderBy: { conductedDate: 'desc' },
  });

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/eoc" className="text-sm text-muted-foreground/70 hover:text-slate-300">Environment of Care</Link>
            <span className="text-muted-foreground">›</span>
            <span className="text-sm text-foreground font-medium">Safety Rounds</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mt-1">Life Safety Rounds</h1>
          <p className="text-sm text-muted-foreground/70 mt-0.5">Monthly environment-of-care rounds, fire safety inspections, and ligature surveys</p>
        </div>
        <a href="/eoc/rounds/new" className="px-3 py-1.5 text-sm rounded-md bg-sky-600 hover:bg-sky-500 text-white font-medium transition-colors">
          + Start New Round
        </a>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3 rounded-lg bg-card border border-border text-center">
          <p className="text-2xl font-bold text-foreground">{rounds.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Total Rounds (YTD)</p>
        </div>
        <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-700/40 text-center">
          <p className="text-2xl font-bold text-amber-400">{rounds.filter(r => r.status === 'IN_PROGRESS').length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">In Progress</p>
        </div>
        <div className="p-3 rounded-lg bg-red-950/30 border border-red-700/40 text-center">
          <p className="text-2xl font-bold text-red-400">{rounds.reduce((a, r) => a + r.openItems, 0)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Total Open Items</p>
        </div>
        <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-700/40 text-center">
          <p className="text-2xl font-bold text-emerald-400">{rounds.filter(r => ['REVIEWED','APPROVED'].includes(r.status)).length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Reviewed / Approved</p>
        </div>
      </div>

      {/* Rounds list */}
      <div className="space-y-3">
        {rounds.map(round => {
          const Icon = statusIcon[round.status] ?? ClipboardList;
          const typeInfo = typeBadge[round.roundType] ?? { label: String(round.roundType).replace(/_/g, ' '), color: 'bg-slate-800 text-slate-300' };
          return (
            <div key={round.id} className="bg-card rounded-xl border border-border p-5 hover:border-slate-500/50 transition-colors">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${round.status === 'IN_PROGRESS' ? 'text-amber-400' : round.status === 'REVIEWED' || round.status === 'APPROVED' ? 'text-emerald-400' : 'text-sky-400'}`} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${typeInfo.color}`}>{typeInfo.label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[round.status]}`}>{round.status.replace('_', ' ')}</span>
                      {round.openItems > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-950/40 text-red-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> {round.openItems} open
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-foreground mt-1">{TYPE_LABELS[round.roundType] ?? typeInfo.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {round.conductedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {round.conductedBy}
                    </p>
                    {round.participantIds.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-0.5">+ {round.participantIds.join(', ')}</p>
                    )}
                    <p className="text-xs text-muted-foreground/70 mt-2 leading-relaxed">{round.summary}</p>
                    {round.areasInspected.length > 0 && round.areasInspected[0] !== 'Administrative' && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {round.areasInspected.map(a => (
                          <span key={a} className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-muted-foreground/70">
                            {a}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground font-mono">{round.roundNumber}</span>
                  {round.totalItems > 0 && (
                    <span className="text-xs text-muted-foreground">{round.totalItems} checklist items</span>
                  )}
                  <Link
                    href={`/eoc/rounds/${round.id}`}
                    className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300"
                  >
                    View details <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
