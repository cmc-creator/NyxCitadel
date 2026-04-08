import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, AlertTriangle, Shield , Pencil } from 'lucide-react';
import { PrintButton } from '@/components/ui/PrintButton';
import StatusUpdater from '@/components/trackers/StatusUpdater';

export const dynamic = 'force-dynamic';

const STATUS_COLOR: Record<string, string> = {
  RECONCILED: 'bg-green-100 text-green-700',
  DISCREPANCY_OPEN: 'bg-red-100 text-red-700',
  DISCREPANCY_EXPLAINED: 'bg-yellow-100 text-yellow-700',
  REPORTED_DEA: 'bg-teal-50 text-teal-700',
  INVESTIGATION: 'bg-orange-100 text-orange-700',
};

const STATUS_OPTIONS = [
  { value: 'RECONCILED', label: 'Reconciled', color: 'green' },
  { value: 'DISCREPANCY_OPEN', label: 'Discrepancy Open', color: 'red' },
  { value: 'DISCREPANCY_EXPLAINED', label: 'Discrepancy Explained', color: 'yellow' },
  { value: 'REPORTED_DEA', label: 'Reported to DEA', color: 'purple' },
  { value: 'INVESTIGATION', label: 'Under Investigation', color: 'orange' },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (value === undefined || value === null) return null;
  return (
    <div>
      <dt className="text-xs text-muted-foreground/70">{label}</dt>
      <dd className="text-sm font-medium text-foreground mt-0.5">{value}</dd>
    </div>
  );
}

export default async function ControlledSubstanceLogDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect('/login');

  const log = await prisma.controlledSubstanceLog.findUnique({ where: { id: params.id } });

  if (!log || log.facilityId !== session.user.facilityId) notFound();

  const openDiscrepancy = log.discrepancyFound && log.status === 'DISCREPANCY_OPEN';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/pharmacy/controlled-substances" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-foreground transition">
          <ArrowLeft className="w-4 h-4" /> Back to Controlled Substances
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/pharmacy/controlled-substances/${params.id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-foreground/80 rounded-lg font-medium transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Link>
          <PrintButton />
        </div>
      </div>

      {openDiscrepancy && (
        <div className="flex items-start gap-3 bg-red-950/20 border border-red-300 text-red-800 rounded-2xl p-4">
          <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Open Discrepancy - Action Required</p>
            <p className="text-sm mt-0.5">
              A count discrepancy of <strong>{log.countDifference ?? 0}</strong> remains unresolved.
              Investigate, document explanation, and report to DEA if theft or significant loss is suspected.
            </p>
          </div>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Shield className="w-5 h-5 text-teal-500" />
              <span className="text-xs font-mono text-muted-foreground/70">Schedule {log.schedule}</span>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLOR[log.status] ?? 'bg-slate-100 text-slate-600'}`}>
                {log.status.replace(/_/g, ' ')}
              </span>
              {log.discrepancyFound && (
                <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold bg-red-100 text-red-700">Discrepancy Found</span>
              )}
            </div>
            <h1 className="text-xl font-bold text-foreground">{log.medicationName}</h1>
            <p className="text-sm text-slate-500 mt-1">{log.unit} &middot; {log.shift} Shift &middot; {formatDate(log.logDate)}</p>
          </div>
          <StatusUpdater apiPath={`/api/controlled-substances/${log.id}`} currentStatus={log.status} options={STATUS_OPTIONS} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          <Section title="Count Details">
            <dl className="grid grid-cols-2 gap-3">
              <div>
                <dt className="text-xs text-muted-foreground/70">Amount Expected</dt>
                <dd className="text-2xl font-bold text-foreground mt-0.5">{log.amountExpected}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground/70">Amount Counted</dt>
                <dd className="text-2xl font-bold text-foreground mt-0.5">{log.amountCounted}</dd>
              </div>
              {log.discrepancyFound && (
                <div className="col-span-2">
                  <dt className="text-xs text-muted-foreground/70">Count Difference</dt>
                  <dd className={`text-2xl font-bold mt-0.5 ${(log.countDifference ?? 0) !== 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {log.countDifference ?? 0}
                  </dd>
                </div>
              )}
            </dl>
          </Section>

          {log.discrepancyExplanation && (
            <Section title="Discrepancy Explanation">
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">{log.discrepancyExplanation}</p>
            </Section>
          )}
        </div>

        <div className="space-y-5">
          <Section title="Log Details">
            <dl className="space-y-3">
              <Field label="Log Date" value={formatDate(log.logDate)} />
              <Field label="Unit" value={log.unit} />
              <Field label="Shift" value={log.shift} />
              <Field label="Schedule" value={`Schedule ${log.schedule}`} />
              <Field label="Counted By" value={log.countedBy} />
              <Field label="Witness" value={log.witnessName} />
              <div>
                <dt className="text-xs text-muted-foreground/70">Reported to Pharmacy</dt>
                <dd className={`text-sm font-semibold mt-0.5 ${log.reportedToPharmacy ? 'text-orange-600' : 'text-muted-foreground/70'}`}>
                  {log.reportedToPharmacy ? `Yes - ${log.reportedDate ? formatDate(log.reportedDate) : ''}` : 'No'}
                </dd>
              </div>
            </dl>
          </Section>
        </div>
      </div>
    </div>
  );
}
