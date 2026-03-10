import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, ShieldAlert, AlertTriangle , Pencil } from 'lucide-react';
import PrintButton from '@/components/ui/PrintButton';

export const dynamic = 'force-dynamic';

const RISK_COLOR: Record<string, string> = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CONFIRMED: 'bg-red-100 text-red-800',
};

const STATUS_COLOR: Record<string, string> = {
  UNDER_REVIEW: 'bg-blue-100 text-blue-800',
  INVESTIGATION: 'bg-yellow-100 text-yellow-800',
  NOTIFIED: 'bg-purple-100 text-purple-800',
  REPORTED_TO_HHS: 'bg-orange-100 text-orange-800',
  CLOSED: 'bg-gray-100 text-gray-600',
};

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

export default async function HipaaBreachDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect('/login');

  const breach = await prisma.hipaaBreachLog.findUnique({ where: { id: params.id } });

  if (!breach || breach.facilityId !== session.user.facilityId) notFound();

  const isReportable = breach.reportableBreach;
  const hhsDue = breach.hhsNotifyDate;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/hipaa/breaches" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" /> Back to HIPAA Breach Log
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/hipaa/breaches/${params.id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Link>
          <PrintButton />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <span className="text-xs font-mono text-slate-400">{breach.incidentNumber}</span>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${RISK_COLOR[breach.riskAssessment] ?? 'bg-slate-100 text-slate-600'}`}>
                {breach.riskAssessment} RISK
              </span>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLOR[breach.status] ?? 'bg-slate-100 text-slate-600'}`}>
                {breach.status.replace(/_/g, ' ')}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">{breach.breachType.replace(/_/g, ' ')}</h1>
            <p className="text-sm text-slate-500 mt-1">
              Discovered: <strong>{formatDate(breach.discoveryDate)}</strong>
              {breach.incidentDate && <> &middot; Incident: <strong>{formatDate(breach.incidentDate)}</strong></>}
            </p>
          </div>
        </div>
      </div>

      {isReportable && !breach.hhsNotifyDate && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-800">HHS Notification Required</p>
            <p className="text-sm text-red-700 mt-1">This breach is reportable. HHS must be notified within 60 days of discovery if ≥500 individuals affected.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          <Section title="Description">
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{breach.description}</p>
          </Section>

          <Section title="Immediate Actions Taken">
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{breach.immediateActions}</p>
          </Section>

          {breach.notes && (
            <Section title="Investigation Notes">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{breach.notes}</p>
            </Section>
          )}
        </div>

        <div className="space-y-5">
          <Section title="Breach Details">
            <dl className="space-y-3">
              <Field label="Breach Type" value={breach.breachType.replace(/_/g, ' ')} />
              <Field label="PHI Involved" value={breach.phiInvolved.join(', ')} />
              <Field label="Individuals Affected" value={breach.individualCount?.toString()} />
              <Field label="Risk Assessment" value={breach.riskAssessment} />
              <Field label="Discovery Date" value={formatDate(breach.discoveryDate)} />
              {breach.incidentDate && <Field label="Incident Date" value={formatDate(breach.incidentDate)} />}
            </dl>
          </Section>

          <Section title="Regulatory Reporting">
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-slate-400">Reportable Breach</dt>
                <dd className={`text-sm font-semibold mt-0.5 ${isReportable ? 'text-red-600' : 'text-green-600'}`}>
                  {isReportable ? 'Yes — Reportable' : 'No / Under Review'}
                </dd>
              </div>
              {hhsDue && <Field label="HHS Notify By" value={formatDate(hhsDue)} />}
              {breach.mediaNotifyDate && <Field label="Media Notification" value={formatDate(breach.mediaNotifyDate)} />}
              {breach.individualNotifyDate && <Field label="Individual Notification" value={formatDate(breach.individualNotifyDate)} />}
            </dl>
          </Section>

          <Section title="Status">
            <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${STATUS_COLOR[breach.status] ?? 'bg-slate-100 text-slate-600'}`}>
              {breach.status.replace(/_/g, ' ')}
            </span>
            {breach.closedDate && (
              <p className="text-xs text-slate-400 mt-2">Closed: {formatDate(breach.closedDate)}</p>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}
