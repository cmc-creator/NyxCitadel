import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, AlertCircle , Pencil } from 'lucide-react';
import StatusUpdater from '@/components/trackers/StatusUpdater';
import PrintButton from '@/components/ui/PrintButton';

export const dynamic = 'force-dynamic';

const SEVERITY_COLOR: Record<string, string> = {
  IMMEDIATE_JEOPARDY: 'bg-red-600 text-white',
  HIGH: 'bg-red-100 text-red-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  LOW: 'bg-green-100 text-green-800',
  OBSERVATION: 'bg-slate-100 text-slate-600',
};

const STATUS_OPTIONS = [
  { value: 'OPEN', label: 'Open', color: 'bg-red-100 text-red-800' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'RESOLVED', label: 'Resolved', color: 'bg-green-100 text-green-800' },
  { value: 'VERIFIED', label: 'Verified', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'ACCEPTED', label: 'Accepted Risk', color: 'bg-gray-100 text-gray-600' },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="text-sm font-medium text-slate-800 mt-0.5">{value}</dd>
    </div>
  );
}

export default async function EocDeficiencyDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect('/login');

  const def = await prisma.eocDeficiency.findUnique({
    where: { id: params.id },
    include: { round: { select: { id: true, roundNumber: true, roundType: true } } },
  });

  if (!def || def.facilityId !== session.user.facilityId) notFound();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/eoc/deficiencies" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Deficiencies
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/eoc/deficiencies/${params.id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Link>
          <PrintButton />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <span className="text-xs font-mono text-slate-400">{def.defNumber}</span>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${SEVERITY_COLOR[def.severity] ?? 'bg-slate-100 text-slate-600'}`}>
                {def.severity.replace(/_/g, ' ')}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">{def.category.replace(/_/g, ' ')}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {def.location}{def.unit && ` · ${def.unit}`}
            </p>
          </div>
          <StatusUpdater apiPath={`/api/eoc/deficiencies/${def.id}`} currentStatus={def.status} options={STATUS_OPTIONS} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          <Section title="Description">
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{def.description}</p>
          </Section>

          {def.notes && (
            <Section title="Notes">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{def.notes}</p>
            </Section>
          )}
        </div>

        <div className="space-y-5">
          <Section title="Deficiency Details">
            <dl className="space-y-3">
              <Field label="Category" value={def.category.replace(/_/g, ' ')} />
              <Field label="Severity" value={def.severity.replace(/_/g, ' ')} />
              <Field label="Location" value={def.location} />
              {def.unit && <Field label="Unit" value={def.unit} />}
              {def.assignedTo && <Field label="Assigned To" value={def.assignedTo} />}
              {def.dueDate && <Field label="Due Date" value={formatDate(def.dueDate)} />}
              {def.resolvedDate && <Field label="Resolved" value={formatDate(def.resolvedDate)} />}
              {def.resolvedBy && <Field label="Resolved By" value={def.resolvedBy} />}
              {def.verificationDate && <Field label="Verified Date" value={formatDate(def.verificationDate)} />}
              {def.verifiedBy && <Field label="Verified By" value={def.verifiedBy} />}
            </dl>
          </Section>

          {def.round && (
            <Section title="Originating Round">
              <Link href={`/eoc/rounds/${def.round.id}`} className="text-sm text-indigo-600 hover:underline">
                {def.round.roundNumber} - {def.round.roundType.replace(/_/g, ' ')} →
              </Link>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
