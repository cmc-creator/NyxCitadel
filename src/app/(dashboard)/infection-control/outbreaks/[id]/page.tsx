import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, AlertTriangle, Bug } from 'lucide-react';
import StatusUpdater from '@/components/trackers/StatusUpdater';
import PrintButton from '@/components/ui/PrintButton';

export const dynamic = 'force-dynamic';

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active', color: 'bg-red-100 text-red-800' },
  { value: 'CONTAINED', label: 'Contained', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'SURVEILLANCE', label: 'Surveillance', color: 'bg-blue-100 text-blue-800' },
  { value: 'RESOLVED', label: 'Resolved', color: 'bg-green-100 text-green-800' },
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

export default async function OutbreakDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect('/login');

  const outbreak = await prisma.icOutbreak.findUnique({ where: { id: params.id } });

  if (!outbreak || outbreak.facilityId !== session.user.facilityId) notFound();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/infection-control/outbreaks" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Outbreaks
        </Link>
        <PrintButton />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Bug className="w-5 h-5 text-orange-600" />
              <span className="text-xs font-mono text-slate-400">{outbreak.outbreakNumber}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">{outbreak.organism}</h1>
            <p className="text-sm text-slate-500 mt-1">
              Unit: <strong>{outbreak.unitAffected}</strong>
              &middot; Cases: <strong>{outbreak.caseCount}</strong>
              &middot; Started: <strong>{formatDate(outbreak.startDate)}</strong>
            </p>
          </div>
          <StatusUpdater apiPath={`/api/infection-control/outbreaks/${outbreak.id}`} currentStatus={outbreak.status} options={STATUS_OPTIONS} />
        </div>
      </div>

      {outbreak.status === 'ACTIVE' && !outbreak.reportedToHealth && (
        <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
          <p className="text-sm font-semibold text-orange-800">Public health reporting may be required. Review reporting obligation.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          {outbreak.summary && (
            <Section title="Summary">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{outbreak.summary}</p>
            </Section>
          )}

          {outbreak.containmentActions.length > 0 && (
            <Section title="Containment Actions">
              <ul className="space-y-2">
                {outbreak.containmentActions.map((action, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-teal-500 mt-0.5">•</span>{action}
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>

        <div className="space-y-5">
          <Section title="Outbreak Details">
            <dl className="space-y-3">
              <Field label="Number" value={outbreak.outbreakNumber} />
              <Field label="Organism" value={outbreak.organism} />
              <Field label="Unit Affected" value={outbreak.unitAffected} />
              <div>
                <dt className="text-xs text-slate-400">Case Count</dt>
                <dd className="text-sm font-bold text-slate-800 mt-0.5 text-lg">{outbreak.caseCount}</dd>
              </div>
              <Field label="Start Date" value={formatDate(outbreak.startDate)} />
              {outbreak.endDate && <Field label="End Date" value={formatDate(outbreak.endDate)} />}
            </dl>
          </Section>

          <Section title="Public Health Reporting">
            <dl className="space-y-2">
              <div>
                <dt className="text-xs text-slate-400">Reported to Health Dept</dt>
                <dd className={`text-sm font-semibold mt-0.5 ${outbreak.reportedToHealth ? 'text-green-600' : 'text-yellow-600'}`}>
                  {outbreak.reportedToHealth ? `Yes — ${outbreak.reportDate ? formatDate(outbreak.reportDate) : ''}` : 'Not Yet Reported'}
                </dd>
              </div>
            </dl>
          </Section>
        </div>
      </div>
    </div>
  );
}
