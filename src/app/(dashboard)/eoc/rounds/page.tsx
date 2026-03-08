import Link from 'next/link';
import { ClipboardList, CheckCircle2, Clock, AlertTriangle, ChevronRight } from 'lucide-react';

const rounds = [
  {
    id: 'EOC-ROUND-2026-03',
    roundNumber: 'EOC-ROUND-2026-03',
    type: 'LIFE_SAFETY_GENERAL',
    label: 'Monthly Life Safety Round',
    conductedDate: '2026-03-07',
    conductedBy: 'Carlos Vega, EOC Chair',
    participants: ['Maria Santos RN', 'Darnell Williams MHT'],
    areas: ['Acute Adult Unit', 'Nursing Stations', 'Medication Room', 'Stairwells', 'Mechanical Room'],
    totalItems: 42,
    openItems: 3,
    status: 'IN_PROGRESS',
    summary: 'Round in progress. Three open deficiencies identified: two ligature-related, one fire door.',
  },
  {
    id: 'EOC-ROUND-2026-LIG-01',
    roundNumber: 'EOC-ROUND-2026-LIG-01',
    type: 'LIGATURE_RISK',
    label: 'Quarterly Ligature Risk Survey',
    conductedDate: '2026-02-20',
    conductedBy: 'Compliance Officer / Carlos Vega',
    participants: ['Maria Santos RN', 'Risk Manager'],
    areas: ['All Patient Rooms', 'Bathrooms', 'Group Therapy Rooms', 'Seclusion Room', 'Common Areas'],
    totalItems: 10,
    openItems: 4,
    status: 'COMPLETED',
    summary: 'Full facility ligature survey completed per JCAHO EC.02.06.01. 10 items identified; 1 IMMEDIATE (seclusion shower rod), 3 HIGH, 4 MEDIUM, 2 LOW. Written mitigation plans issued for all.',
  },
  {
    id: 'EOC-ROUND-2026-02',
    roundNumber: 'EOC-ROUND-2026-02',
    type: 'LIFE_SAFETY_GENERAL',
    label: 'Monthly Life Safety Round',
    conductedDate: '2026-02-07',
    conductedBy: 'Carlos Vega, EOC Chair',
    participants: ['Linda Park CNO', 'Facilities Manager'],
    areas: ['Adolescent Unit', 'Step-Down Unit', 'Family Visitation', 'Cafeteria', 'Parking/Exterior'],
    totalItems: 38,
    openItems: 0,
    status: 'REVIEWED',
    summary: 'All findings from January round resolved. New items: 1 burned-out exit sign (corrected same day), 1 blocked egress in storage (cleared same day). All issues resolved before round end.',
  },
  {
    id: 'EOC-ROUND-2026-FIRE-01',
    roundNumber: 'EOC-ROUND-2026-FIRE-01',
    type: 'FIRE_SAFETY',
    label: 'Annual Fire Safety Round (with Fire Marshal)',
    conductedDate: '2026-01-20',
    conductedBy: 'Carlos Vega + Peoria Fire Dept.',
    participants: ['Peoria Fire Marshal – D. Hughes', 'Carlos Vega EOC Chair', 'Facilities Manager'],
    areas: ['All Areas', 'Mechanical Rooms', 'Electrical Rooms', 'Sprinkler Risers', 'Egress Routes'],
    totalItems: 55,
    openItems: 1,
    status: 'REVIEWED',
    summary: 'Annual fire inspection with Peoria Fire Department. Passed overall. One deficiency: kitchen hood suppression service overdue — corrective action plan issued. Certificate of Compliance issued pending hood service.',
  },
  {
    id: 'EOC-ROUND-2026-01',
    roundNumber: 'EOC-ROUND-2026-01',
    type: 'LIFE_SAFETY_GENERAL',
    label: 'Monthly Life Safety Round',
    conductedDate: '2026-01-10',
    conductedBy: 'Carlos Vega, EOC Chair',
    participants: ['Maria Santos RN'],
    areas: ['Acute Adult Unit', 'Nursing Stations', 'Medication Room', 'Seclusion Rooms', 'Stairwells'],
    totalItems: 40,
    openItems: 0,
    status: 'REVIEWED',
    summary: 'Routine monthly round. No new deficiencies identified. All prior open items verified resolved.',
  },
  {
    id: 'EOC-ROUND-2025-EOC-COMM-12',
    roundNumber: 'EOC-ROUND-2025-EOC-COMM-12',
    type: 'EOC_COMMITTEE',
    label: 'EOC Committee Meeting – December',
    conductedDate: '2025-12-18',
    conductedBy: 'Carlos Vega, EOC Chair',
    participants: ['Linda Park CNO', 'James Holloway CEO', 'Maria Santos RN', 'Facilities Manager', 'Security Director'],
    areas: ['Administrative'],
    totalItems: 0,
    openItems: 0,
    status: 'APPROVED',
    summary: 'Q4 EOC report presented to committee. Annual program evaluation accepted. 2026 EOC calendar approved. Ligature risk re-assessment scheduled for Q1 2026.',
  },
];

const typeBadge: Record<string, { label: string; color: string }> = {
  LIFE_SAFETY_GENERAL: { label: 'Life Safety', color: 'bg-sky-950/50 text-sky-300 border border-sky-700/40' },
  LIGATURE_RISK: { label: 'Ligature Risk', color: 'bg-amber-950/50 text-amber-300 border border-amber-700/40' },
  FIRE_SAFETY: { label: 'Fire Safety', color: 'bg-red-950/50 text-red-300 border border-red-700/40' },
  INFECTION_CONTROL: { label: 'Infection Control', color: 'bg-teal-950/50 text-teal-300 border border-teal-700/40' },
  SECURITY: { label: 'Security', color: 'bg-purple-950/50 text-purple-300 border border-purple-700/40' },
  UTILITIES: { label: 'Utilities', color: 'bg-orange-950/50 text-orange-300 border border-orange-700/40' },
  PATIENT_ENVIRONMENT: { label: 'Patient Environment', color: 'bg-emerald-950/50 text-emerald-300 border border-emerald-700/40' },
  EOC_COMMITTEE: { label: 'EOC Committee', color: 'bg-violet-950/50 text-violet-300 border border-violet-700/40' },
};

const statusBadge: Record<string, string> = {
  IN_PROGRESS: 'bg-amber-950/40 text-amber-400',
  COMPLETED: 'bg-sky-950/40 text-sky-400',
  REVIEWED: 'bg-emerald-950/40 text-emerald-400',
  APPROVED: 'bg-purple-950/40 text-purple-400',
};

const statusIcon: Record<string, React.ElementType> = {
  IN_PROGRESS: Clock,
  COMPLETED: ClipboardList,
  REVIEWED: CheckCircle2,
  APPROVED: CheckCircle2,
};

export default function EocRoundsPage() {
  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/eoc" className="text-sm text-slate-400 hover:text-slate-300">Environment of Care</Link>
            <span className="text-slate-600">›</span>
            <span className="text-sm text-foreground font-medium">Safety Rounds</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mt-1">Life Safety Rounds</h1>
          <p className="text-sm text-slate-400 mt-0.5">Monthly environment-of-care rounds, fire safety inspections, and ligature surveys</p>
        </div>
        <button className="px-3 py-1.5 text-sm rounded-md bg-sky-600 hover:bg-sky-500 text-white font-medium transition-colors">
          + Start New Round
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3 rounded-lg bg-card border border-border text-center">
          <p className="text-2xl font-bold text-foreground">{rounds.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Total Rounds (YTD)</p>
        </div>
        <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-700/40 text-center">
          <p className="text-2xl font-bold text-amber-400">{rounds.filter(r => r.status === 'IN_PROGRESS').length}</p>
          <p className="text-xs text-slate-500 mt-0.5">In Progress</p>
        </div>
        <div className="p-3 rounded-lg bg-red-950/30 border border-red-700/40 text-center">
          <p className="text-2xl font-bold text-red-400">{rounds.reduce((a, r) => a + r.openItems, 0)}</p>
          <p className="text-xs text-slate-500 mt-0.5">Total Open Items</p>
        </div>
        <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-700/40 text-center">
          <p className="text-2xl font-bold text-emerald-400">{rounds.filter(r => ['REVIEWED','APPROVED'].includes(r.status)).length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Reviewed / Approved</p>
        </div>
      </div>

      {/* Rounds list */}
      <div className="space-y-3">
        {rounds.map(round => {
          const Icon = statusIcon[round.status] ?? ClipboardList;
          const typeInfo = typeBadge[round.type] ?? { label: round.type, color: 'bg-slate-800 text-slate-300' };
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
                    <p className="text-sm font-semibold text-foreground mt-1">{round.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {round.conductedDate} · {round.conductedBy}
                    </p>
                    {round.participants.length > 0 && (
                      <p className="text-xs text-slate-600 mt-0.5">+ {round.participants.join(', ')}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{round.summary}</p>
                    {round.areas.length > 0 && round.areas[0] !== 'Administrative' && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {round.areas.map(a => (
                          <span key={a} className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                            {a}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-xs text-slate-600 font-mono">{round.roundNumber}</span>
                  {round.totalItems > 0 && (
                    <span className="text-xs text-slate-500">{round.totalItems} checklist items</span>
                  )}
                  <Link
                    href={`/eoc/rounds/${round.id}`}
                    className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
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
