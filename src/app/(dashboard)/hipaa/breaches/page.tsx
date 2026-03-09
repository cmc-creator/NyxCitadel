import { Lock, Plus, AlertTriangle, CheckCircle } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const typeLabels: Record<string, string> = {
  UNAUTHORIZED_ACCESS:         'Unauthorized Access',
  IMPROPER_DISPOSAL:           'Improper Disposal',
  LOST_STOLEN_DEVICE:          'Lost/Stolen Device',
  RANSOMWARE_CYBERATTACK:      'Ransomware/Cyberattack',
  MISDIRECTED_COMMUNICATIONS:  'Misdirected Communication',
  INSIDER_THREAT:              'Insider Threat',
  VERBAL_DISCLOSURE:           'Verbal Disclosure',
  OTHER:                       'Other',
};

const statusConfig: Record<string, { label: string; color: string }> = {
  UNDER_REVIEW:    { label: 'Under Review',  color: 'bg-amber-100 text-amber-700' },
  INVESTIGATION:   { label: 'Investigation', color: 'bg-red-100 text-red-700' },
  NOTIFIED:        { label: 'Notified',      color: 'bg-blue-100 text-blue-700' },
  CLOSED:          { label: 'Closed',        color: 'bg-emerald-100 text-emerald-700' },
  REPORTED_TO_HHS: { label: 'Reported HHS', color: 'bg-purple-100 text-purple-700' },
};

const riskColor: Record<string, string> = {
  LOW:       'text-emerald-400',
  MEDIUM:    'text-amber-400',
  HIGH:      'text-red-400',
  CONFIRMED: 'text-red-500',
};

export default async function BreachLogPage({ searchParams }: { searchParams: { filter?: string } }) {
  const session = await auth();
  const facilityId = session!.user.facilityId;
  const filter = searchParams.filter ?? 'ALL';

  const breaches = await prisma.hipaaBreachLog.findMany({
    where: {
      facilityId,
      ...(filter === 'OPEN'   ? { status: { notIn: ['CLOSED', 'REPORTED_TO_HHS'] } } : {}),
      ...(filter === 'CLOSED' ? { status: { in:    ['CLOSED', 'REPORTED_TO_HHS'] } } : {}),
    },
    orderBy: { discoveryDate: 'desc' },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Lock className="w-5 h-5 text-blue-400" />
            <h1 className="text-xl font-bold text-white">HIPAA Breach Log</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">§164.400 Breach Rule</span>
          </div>
          <p className="text-slate-400 text-sm">Privacy incidents and confirmed breaches. Reportable breaches require HHS notification within 60 days.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Log Incident
        </button>
      </div>

      <div className="rounded-xl border border-blue-500/20 bg-blue-500/8 p-4">
        <p className="text-xs font-semibold text-blue-300 mb-2">HIPAA Breach Notification Timelines</p>
        <div className="grid md:grid-cols-3 gap-3 text-xs">
          {[
            { req: 'Individual notification',                   timing: 'Within 60 days of discovery' },
            { req: 'HHS notification (≥500 individuals)',       timing: 'Within 60 days; must also notify media' },
            { req: 'Annual HHS report (<500 individuals)',      timing: 'By March 1 of following year' },
          ].map(r => (
            <div key={r.req} className="flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white font-medium">{r.req}</p>
                <p className="text-blue-200/60">{r.timing}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        {(['ALL', 'OPEN', 'CLOSED'] as const).map(f => (
          <a key={f} href={`/hipaa/breaches?filter=${f}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white border border-white/10'}`}>
            {f}
          </a>
        ))}
      </div>

      <div className="space-y-4">
        {breaches.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-slate-800/50 p-8 text-center text-slate-500 text-sm">
            No breach incidents on record.
          </div>
        ) : breaches.map(b => (
          <div key={b.id} className={`rounded-xl border p-5 ${b.status !== 'CLOSED' && b.status !== 'REPORTED_TO_HHS' ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/10 bg-slate-800/50'}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-slate-400">{b.incidentNumber}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusConfig[b.status]?.color ?? 'bg-slate-100 text-slate-600'}`}>
                    {statusConfig[b.status]?.label ?? b.status}
                  </span>
                  {b.reportableBreach && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">REPORTABLE</span>
                  )}
                </div>
                <h3 className="text-white font-bold text-sm">{typeLabels[b.breachType] ?? b.breachType}</h3>
              </div>
              <div className="text-right text-xs">
                <p className="text-slate-400">Discovered: {b.discoveryDate.toLocaleDateString()}</p>
                <p className={`font-bold mt-1 ${riskColor[b.riskAssessment ?? ''] ?? 'text-slate-400'}`}>Risk: {b.riskAssessment ?? '—'}</p>
              </div>
            </div>
            {b.description && <p className="text-xs text-slate-400 mb-3">{b.description}</p>}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs bg-slate-700 text-slate-300 rounded-full px-3 py-1">{b.individualCount} individual(s) affected</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


const mockBreaches = [
  {
    id: '1', incidentNumber: 'HIPAA-2026-001', discoveryDate: '2026-02-14',
    breachType: 'MISDIRECTED_COMMUNICATIONS', description: 'Patient discharge summary faxed to incorrect number. 1 patient record disclosed.',
    individualCount: 1, phiInvolved: ['Medical history', 'Diagnoses'], riskAssessment: 'LOW',
    reportableBreach: false, status: 'CLOSED', closedDate: '2026-02-18',
  },
  {
    id: '2', incidentNumber: 'HIPAA-2026-002', discoveryDate: '2026-03-01',
    breachType: 'UNAUTHORIZED_ACCESS', description: 'Employee accessed patient records outside scope of care. 4 patient records reviewed without authorization.',
    individualCount: 4, phiInvolved: ['Demographics', 'Mental health records'], riskAssessment: 'HIGH',
    reportableBreach: true, status: 'UNDER_REVIEW', closedDate: null,
  },
];

const typeLabels: Record<string, string> = {
  UNAUTHORIZED_ACCESS: 'Unauthorized Access',
  IMPROPER_DISPOSAL: 'Improper Disposal',
  LOST_STOLEN_DEVICE: 'Lost/Stolen Device',
  RANSOMWARE_CYBERATTACK: 'Ransomware/Cyberattack',
  MISDIRECTED_COMMUNICATIONS: 'Misdirected Communication',
  INSIDER_THREAT: 'Insider Threat',
  VERBAL_DISCLOSURE: 'Verbal Disclosure',
  OTHER: 'Other',
};

const statusConfig: Record<string, { label: string; color: string }> = {
  UNDER_REVIEW:    { label: 'Under Review',   color: 'bg-amber-100 text-amber-700' },
  INVESTIGATION:   { label: 'Investigation',  color: 'bg-red-100 text-red-700' },
  NOTIFIED:        { label: 'Notified',       color: 'bg-blue-100 text-blue-700' },
  CLOSED:          { label: 'Closed',         color: 'bg-emerald-100 text-emerald-700' },
  REPORTED_TO_HHS: { label: 'Reported HHS',  color: 'bg-purple-100 text-purple-700' },
};

const riskColor: Record<string, string> = {
  LOW:       'text-emerald-400',
  MEDIUM:    'text-amber-400',
  HIGH:      'text-red-400',
  CONFIRMED: 'text-red-500',
};

export default function BreachLogPage() {
  const [filter, setFilter] = useState('ALL');
  const filtered = filter === 'ALL' ? mockBreaches : mockBreaches.filter(b => b.status === filter || (filter === 'OPEN' && b.status !== 'CLOSED'));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Lock className="w-5 h-5 text-blue-400" />
            <h1 className="text-xl font-bold text-white">HIPAA Breach Log</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">§164.400 Breach Rule</span>
          </div>
          <p className="text-slate-400 text-sm">Privacy incidents and confirmed breaches. Reportable breaches require HHS notification within 60 days (or 24 hours if media notification required).</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Log Incident
        </button>
      </div>

      {/* Reporting Requirements */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/8 p-4">
        <p className="text-xs font-semibold text-blue-300 mb-2">HIPAA Breach Notification Timelines</p>
        <div className="grid md:grid-cols-3 gap-3 text-xs">
          {[
            { req: 'Individual notification', timing: 'Within 60 days of discovery' },
            { req: 'HHS notification (≥500 individuals)', timing: 'Within 60 days; must also notify media' },
            { req: 'Annual HHS report (<500 individuals)', timing: 'By March 1 of following year' },
          ].map(r => (
            <div key={r.req} className="flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white font-medium">{r.req}</p>
                <p className="text-blue-200/60">{r.timing}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['ALL', 'OPEN', 'CLOSED'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white border border-white/10'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Breach Cards */}
      <div className="space-y-4">
        {filtered.map(b => (
          <div key={b.id} className={`rounded-xl border p-5 ${b.status !== 'CLOSED' ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/10 bg-slate-800/50'}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-slate-400">{b.incidentNumber}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusConfig[b.status]?.color}`}>
                    {statusConfig[b.status]?.label}
                  </span>
                  {b.reportableBreach && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">REPORTABLE</span>
                  )}
                </div>
                <h3 className="text-white font-bold text-sm">{typeLabels[b.breachType] ?? b.breachType}</h3>
              </div>
              <div className="text-right text-xs">
                <p className="text-slate-400">Discovered: {b.discoveryDate}</p>
                <p className={`font-bold mt-1 ${riskColor[b.riskAssessment]}`}>Risk: {b.riskAssessment}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-3">{b.description}</p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs bg-slate-700 text-slate-300 rounded-full px-3 py-1">{b.individualCount} individual(s) affected</span>
              {b.phiInvolved.map(p => (
                <span key={p} className="text-xs bg-slate-700 text-slate-300 rounded-full px-3 py-1">{p}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
